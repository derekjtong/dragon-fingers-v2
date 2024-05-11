import getCurrentUser from "@/app/actions/getCurrentUser";
import getTexts from "@/app/actions/getAllTexts";
import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Attempt to retrieve current user from NextAuth
    const currentUser = await getCurrentUser();

    // If no user found, return not logged in error
    if (!currentUser || !currentUser.id) {
      throw new Error("User must be logged in");
    }

    // Select a random text
    const texts = await getTexts();
    const randomText = texts[Math.floor(Math.random() * texts.length)];

    // Create a new match
    const newMatch = await prisma.match.create({
      data: {
        ownerId: currentUser.id,
        textId: randomText.id,
        participants: {
          create: [
            {
              userId: currentUser.id,
              speed: 0,
              accuracy: 0,
            },
          ],
        },
      },
    });

    return NextResponse.json(newMatch);
  } catch (error: any) {
    return new NextResponse("Internal Error", {
      status: 500,
    });
  }
}
