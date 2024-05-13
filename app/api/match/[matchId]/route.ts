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
      return new NextResponse("Invalid match format", { status: 404 });
    }

    const match = await prisma.match.findUnique({
      where: {
        id: matchId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!match) {
      return new NextResponse("No match found with the given code", { status: 404 });
    }

    if (!match.owner) {
      match.owner = { id: "deleted-user", name: "Deleted User", image: "" };
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

    if (!currentUser || !currentUser.id || !currentUser.email || !currentUser.name) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const match = await prisma.match.findUnique({
      where: {
        id: matchId,
      },
    });
    if (!match) {
      return new NextResponse("No match found with the given code", { status: 404 });
    }

    // Match is over, do not send anything
    if (match.endTime !== null) {
      return new NextResponse("Already ended", { status: 208 });
    }

    const update: MatchUpdateMessage = {
      name: currentUser.name,
      userId: currentUser.id,
      charCount,
      status: "",
      winnerId: "",
      winnerName: "",
    };
    await pusherServer.trigger(matchId, "progress-update", update);

    const updatedParticipant = await prisma.participant.update({
      where: {
        userId_matchId: {
          matchId: matchId,
          userId: currentUser.id,
        },
      },
      data: {
        charCount: charCount,
      },
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
    const currentUser = await getCurrentUser();

    const { matchId } = params;

    // Validate matchId format
    if (!matchId || !/^[0-9a-fA-F]{24}$/.test(matchId)) {
      return new NextResponse("Invalid match format", { status: 404 });
    }

    // Fetch the match from the database using the provided matchId
    const match = await prisma.match.findUnique({
      where: {
        id: matchId,
      },
      include: {
        winner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Check if match exists
    if (!match) {
      return new NextResponse("Match not found", { status: 404 });
    }

    // Send end game message
    const update: MatchUpdateMessage = {
      name: "admin",
      userId: "whatever",
      charCount: 0,
      status: "ended",
      winnerId: match.winnerUserId || "",
      winnerName: match.winner?.name || "",
    };
    await pusherServer.trigger(matchId, "progress-update", update);

    // Check if match is already closed
    if (match.endTime !== null) {
      return new NextResponse("Match is already closed", { status: 208 });
    }

    // If not owner or admin, unauthorized
    if (match.ownerId !== currentUser?.id && !currentUser?.isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update record
    const updatedMatch = await prisma.match.update({
      where: {
        id: matchId,
      },
      data: {
        endTime: new Date(),
        allowJoin: false,
      },
    });

    return new NextResponse("Ended match", { status: 200 });
  } catch (error: any) {
    console.log("Error ending match:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
