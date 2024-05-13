import getAllMatches from "@/app/actions/getAllMatches";
import getCurrentUser from "@/app/actions/getCurrentUser";
import getProgrammingJoke from "@/app/actions/getProgrammingJokeId";
import getTexts from "@/app/actions/getTexts";
import prisma from "@/app/libs/prismadb";
import { Text } from "@prisma/client";
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
    const body = await request.json();
    const textOption = body.textOption || "random";

    // Attempt to retrieve current user from NextAuth
    const currentUser = await getCurrentUser();

    // If no user found, return not logged in error
    if (!currentUser || !currentUser.id) {
      throw new Error("User must be logged in");
    }

    let textid;

    if (textOption === "programmingjoke") {
      const programmingJoke: Text = await getProgrammingJoke();
      textid = programmingJoke.id;
    } else {
      const allTexts = await getTexts();
      textid = allTexts[Math.floor(Math.random() * allTexts.length)].id;
    }

    // Create a new match
    const newMatch = await prisma.match.create({
      data: {
        ownerId: currentUser.id,
        textId: textid,
        allowJoin: true,
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
