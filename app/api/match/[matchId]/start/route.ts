import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";
import { NextResponse } from "next/server";

interface IParams {
  matchId: string;
}

// Start a match
export async function POST(request: Request, { params }: { params: IParams }) {
  try {
    const { matchId } = params;
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const { startTime } = body;

    // User must be logged in
    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

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

    // Check if match already started
    if (match.startTime && Date.now() >= new Date(match.startTime).getTime()) {
      return new NextResponse("Match is in progress", { status: 409 });
    }

    // If not owner or admin, unauthorized
    if (match.ownerId !== currentUser?.image && !currentUser?.isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Send start game message
    const startTimeMessage: MatchStartMessage = {
      startTime,
    };
    await pusherServer.trigger(matchId, "startTime", startTimeMessage);

    // Update record
    const updatedMatch = await prisma.match.update({
      where: {
        id: matchId,
      },
      data: {
        allowJoin: false,
        startTime: new Date(startTime),
      },
    });

    return NextResponse.json(updatedMatch);
  } catch (error: any) {
    console.log("Error ending match:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
