import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";
import { NextResponse } from "next/server";

interface IParams {
  matchId: string;
}

// Get all match participants
export async function GET(request: Request, { params }: { params: IParams }) {
  try {
    const { matchId } = params;

    // Retrieve match participants from database
    const participants = await prisma.participant.findMany({
      where: {
        matchId: matchId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(participants);
  } catch (error) {
    console.error("Error fetching participants:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Join match
export async function POST(request: Request, { params }: { params: IParams }) {
  try {
    const currentUser = await getCurrentUser();
    const { matchId } = params;

    // Validate user
    if (!currentUser?.id || !currentUser?.email || !currentUser?.name) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Validate match
    if (!matchId || !/^[0-9a-fA-F]{24}$/.test(matchId)) {
      return new NextResponse("Invalid match format", { status: 404 });
    }

    // Find match
    const match = await prisma.match.findUnique({
      where: {
        id: matchId,
      },
    });

    // Validate match
    if (!match) {
      return new NextResponse("Match not found", { status: 404 });
    }

    // Do not allow users to join not open matches
    if (!match.allowJoin) {
      return new NextResponse("Match not open for new participants", { status: 403 });
    }

    // Send update
    const update: MatchUpdateMessage = {
      name: currentUser.name,
      userId: currentUser.id,
      charCount: 0,
      status: "open",
    };
    await pusherServer.trigger(matchId, "progress-update", update);

    // Search participant related to user and match
    const existingParticipant = await prisma.participant.findFirst({
      where: {
        matchId: matchId,
        userId: currentUser?.id,
      },
    });

    // If already exists return it
    if (existingParticipant) {
      return NextResponse.json(existingParticipant);
    }

    // Create it if it does not exist
    const newParticipant = await prisma.participant.create({
      data: {
        matchId: matchId,
        userId: currentUser.id,
      },
    });

    return new NextResponse("Participant added", { status: 201 });
  } catch (error: any) {
    console.error("Error posting participant:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// User completed
export async function PATCH(request: Request, { params }: { params: IParams }) {
  try {
    const currentUser = await getCurrentUser();
    const { matchId } = params;
    const body = await request.json();
    const { time } = body;

    // Validate user
    if (!currentUser?.id || !currentUser?.email || !currentUser?.name) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Validate match
    if (!matchId || !/^[0-9a-fA-F]{24}$/.test(matchId)) {
      return new NextResponse("Invalid match format", { status: 404 });
    }

    // Find match
    const match = await prisma.match.findUnique({
      where: {
        id: matchId,
      },
      include: {
        text: true,
        participants: true,
      },
    });

    // Validate match
    if (!match) {
      return new NextResponse("Match not found", { status: 404 });
    }

    const wpm = (match.text.text.length / 5) * (60000 / time);

    // Update participant
    const updatedParticipant = await prisma.participant.update({
      where: {
        userId_matchId: {
          matchId: matchId,
          userId: currentUser.id,
        },
      },
      data: {
        completed: true,
        time: time,
        wpm: wpm,
      },
    });

    // Update user stats
    let stats = await prisma.stats.findUnique({
      where: { userId: currentUser.id },
    });

    if (stats) {
      const newMatchesPlayed = stats.matchesPlayed + 1;
      const newAverageSpeed = (stats.averageSpeed * stats.matchesPlayed + wpm) / newMatchesPlayed;
      const isBest = !stats.bestSpeed || wpm > stats.bestSpeed;
      stats = await prisma.stats.update({
        where: { userId: currentUser.id },
        data: {
          matchesPlayed: stats.matchesPlayed + 1,
          bestSpeed: isBest ? wpm : stats.bestSpeed,
          averageSpeed: newAverageSpeed,
        },
      });
    } else {
      stats = await prisma.stats.create({
        data: {
          userId: currentUser.id,
          averageSpeed: wpm,
          bestSpeed: wpm,
          matchesPlayed: 1,
          matchesWon: 0,
        },
      });
    }

    // Determine if current user is winner
    const highestWpm = Math.max(...match.participants.map((p) => p.wpm || 0), wpm);
    if (wpm >= highestWpm) {
      await prisma.match.update({
        where: { id: matchId },
        data: { winnerUserId: currentUser.id },
      });
    }
    return new NextResponse("Speed rand match stats recorded", { status: 200 });
  } catch (error: any) {
    console.error("Error posting participant:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
