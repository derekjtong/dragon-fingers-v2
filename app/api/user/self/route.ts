import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userStats = await prisma.stats.findUnique({
      where: {
        userId: currentUser.id,
      },
    });

    const userData = {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      createdAt: currentUser.createdAt,
      isAdmin: currentUser.isAdmin,
      isDeleted: currentUser.isDeleted,
      averageSpeed: userStats?.averageSpeed,
      bestSpeed: userStats?.bestSpeed,
      matchesPlayed: userStats?.matchesPlayed,
      matchesWon: userStats?.matchesWon,
    };

    return new NextResponse(JSON.stringify(userData), { status: 200 });
  } catch (error: any) {
    console.log("Error getting user data:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        isDeleted: true,
      },
    });
    return new NextResponse("Success", { status: 200 });
  } catch (error: any) {
    console.log("Error getting user data:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
