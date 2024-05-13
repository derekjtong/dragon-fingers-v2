import getCurrentUser from "@/app/actions/getCurrentUser";
import { inngestClient } from "@/app/libs/inngest";
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
      return new NextResponse("Invalid match format", { status: 404 });
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
    if (match.ownerId !== currentUser?.id && !currentUser?.isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Send start game message
    const startTimeMessage: MatchStartMessage = {
      startTime,
    };
    await pusherServer.trigger(matchId, "startTime", startTimeMessage);

    // Update status to progress
    const update: MatchUpdateMessage = {
      name: "admin",
      userId: "whatever",
      charCount: -1,
      status: "starting",
      winnerId: "",
      winnerName: "",
    };
    await pusherServer.trigger(matchId, "progress-update", update);

    // Cancel any previous
    await inngestClient.send({
      name: "match/schedule-start.cancel",
      data: {
        matchId: matchId,
      },
    });
    // Trigger inngest
    await inngestClient.send({
      name: "match/schedule-start",
      data: {
        matchId: matchId,
        // 5 (countdown) + game duration
      },
    });
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

    // Cancel any previous
    await inngestClient.send({
      name: "match/schedule-end.cancel",
      data: {
        matchId: matchId,
      },
    });
    // Trigger inngest
    await inngestClient.send({
      name: "match/schedule-end",
      data: {
        matchId: matchId,
        seconds: 15,
        // 5 (countdown) + game duration
      },
    });

    return NextResponse.json(updatedMatch);
  } catch (error: any) {
    console.log("Error ending match:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Cancel a match
export async function DELETE(request: Request, { params }: { params: IParams }) {
  try {
    const { matchId } = params;
    const currentUser = await getCurrentUser();

    // User must be logged in
    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Validate matchId format
    if (!matchId || !/^[0-9a-fA-F]{24}$/.test(matchId)) {
      return new NextResponse("Invalid match format", { status: 404 });
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

    // Check if user is authorized to cancel the match (owner or admin)
    if (match.ownerId !== currentUser?.id && !currentUser?.isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update the match to reflect cancellation
    const updatedMatch = await prisma.match.update({
      where: {
        id: matchId,
      },
      data: {
        allowJoin: true,
        startTime: null,
      },
    });

    // Cancel scheduled tasks
    await inngestClient.send({
      name: "match/schedule-start.cancel",
      data: {
        matchId: matchId,
      },
    });
    await inngestClient.send({
      name: "match/schedule-end.cancel",
      data: {
        matchId: matchId,
      },
    });

    // Send start game message
    const startTimeMessage: MatchStartMessage = {
      startTime: null,
    };
    await pusherServer.trigger(matchId, "startTime", startTimeMessage);

    // Notify all participants of the cancellation
    const update: MatchUpdateMessage = {
      name: "admin",
      userId: "whatever",
      charCount: -1,
      status: "open",
      winnerId: "",
      winnerName: "",
    };
    await pusherServer.trigger(matchId, "progress-update", update);

    return NextResponse.json({ message: "Match cancelled successfully", match: updatedMatch });
  } catch (error: any) {
    console.error("Error cancelling match:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
