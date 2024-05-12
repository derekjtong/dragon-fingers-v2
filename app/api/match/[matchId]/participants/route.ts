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
    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Validate match
    if (!matchId || !/^[0-9a-fA-F]{24}$/.test(matchId)) {
      return new NextResponse("Match not found", { status: 404 });
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
    await pusherServer.trigger(matchId, "progress-update", {
      name: currentUser.name,
      userId: currentUser.id,
      charCount: 0,
      status: "",
    });

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
