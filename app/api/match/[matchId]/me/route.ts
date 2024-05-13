import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

interface IParams {
  matchId: string;
}

// Get all match participants
export async function GET(request: Request, { params }: { params: IParams }) {
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

    // Find participant
    const participant = await prisma.participant.findUnique({
      where: {
        userId_matchId: {
          matchId: matchId,
          userId: currentUser.id,
        },
      },
    });

    if (!participant) {
      return new NextResponse("Participant information not found", { status: 404 });
    }

    return NextResponse.json(participant);
  } catch (error) {
    console.error("Error fetching participant:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
