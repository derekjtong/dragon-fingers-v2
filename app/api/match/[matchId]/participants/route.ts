import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";
interface IParams {
  matchId?: string;
}
export async function GET(request: Request, { params }: { params: IParams }) {
  try {
    const { matchId } = params;

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
  }
}
