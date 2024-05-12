import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";
import { NextResponse } from "next/server";

interface IParams {
  matchId: string;
}

export async function GET(request: Request, { params }: { params: IParams }) {
  try {
    const { matchId } = params;
    const currentUser = await getCurrentUser();

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!matchId || !/^[0-9a-fA-F]{24}$/.test(matchId)) {
      return new NextResponse("Match not found", { status: 404 });
    }

    const match = await prisma.match.findUnique({
      where: {
        id: matchId,
      },
    });

    if (!match) {
      return new NextResponse("No match found with the given code", { status: 404 });
    }

    return NextResponse.json(match);
  } catch (err) {
    console.error("Error fetching match:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Update word count
export async function POST(request: Request, { params }: { params: IParams }) {
  try {
    const { matchId } = params;
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const { charCount } = body;

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await pusherServer.trigger(matchId, "progress-update", {
      name: currentUser.name,
      userId: currentUser.id,
      charCount,
      status: "",
    });

    return new NextResponse("Success", { status: 200 });
  } catch (error: any) {
    console.log("Error updating match:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// End a match
export async function PATCH(request: Request, { params }: { params: IParams }) {
  try {
    // Record current time
    const endTime = new Date();

    const { matchId } = params;

    // Validate matchId format
    if (!matchId || !/^[0-9a-fA-F]{24}$/.test(matchId)) {
      return new NextResponse("Match not found", { status: 404 });
    }

    // Fetch the match from the database using the provided matchId
    const match = await prisma.match.findUnique({
      where: {
        id: matchId,
      },
    });

    // Check if match exists
    if (!match) {
      return new NextResponse("Match not found", { status: 404 });
    }

    // Check if match is already closed
    if (!match.allowJoin) {
      return new NextResponse("Match is already closed", { status: 409 });
    }

    // Send end game message
    await pusherServer.trigger(matchId, "progress-update", {
      name: "admin",
      userId: "whatever",
      charCount: 0,
      status: "closed",
    });

    // Update record
    const updatedMatch = await prisma.match.update({
      where: {
        id: matchId,
      },
      data: {
        endTime,
        allowJoin: false,
      },
    });

    return new NextResponse("Ended match", { status: 200 });
  } catch (error: any) {
    console.log("Error ending match:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
