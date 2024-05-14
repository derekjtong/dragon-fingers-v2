import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        isAdmin: true,
        isDeleted: true,
      },
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.log("Error getting user data:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
