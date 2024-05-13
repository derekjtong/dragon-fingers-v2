import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

interface IParams {
  userId: string;
}

export async function GET(request: Request, { params }: { params: IParams }) {
  try {
    const { userId } = params;
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        isAdmin: true,
        isDeleted: true,
        Stats: {
          select: {
            averageSpeed: true,
            bestSpeed: true,
            matchesPlayed: true,
            matchesWon: true,
          },
        },
      },
    });

    if (!user) {
      return new NextResponse("No user found with the given code", { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
