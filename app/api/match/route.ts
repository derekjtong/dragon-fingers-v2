import getAllMatches from "@/app/actions/getAllMatches";
import getTexts from "@/app/actions/getAllTexts";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Attempt to retrieve the all match records from the database
    const match = await getAllMatches();

    // If no matches are found, return a 204 No Content response
    if (!match) {
      return new NextResponse(null, { status: 204 });
    }

    // Return the matches in JSON format
    return NextResponse.json(match);
  } catch (error) {
    // Log the error and return a 500 Internal Server Error response
    console.error("Failed to retrieve text:", error);
    return new NextResponse("Internal Error", {
      status: 500,
    });
  }
}

export async function POST(request: Request) {
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
