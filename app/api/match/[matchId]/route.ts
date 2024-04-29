import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

interface IParams {
  matchId?: string;
}

export async function GET(request: Request, { params }: { params: IParams }) {
  try {
    const { matchId } = params;

    // Validate that matchId is provided
    if (!matchId) {
      // If no matchId is provided, return a 400 Bad Request response
      return new NextResponse("Bad Request: matchId is required", { status: 400 });
    }

    // Validate matchId format
    if (!matchId || !/^[0-9a-fA-F]{24}$/.test(matchId)) {
      return new NextResponse("Invalid code format", { status: 400 });
    }

    // Fetch the match from the database using the provided matchId
    const match = await prisma.match.findUnique({
      where: {
        id: matchId,
      },
    });

    console.log(match);

    // Check if the match was found
    if (match) {
      // If found, return the match data in JSON format
      return new NextResponse(JSON.stringify(match), {
        headers: {
          "Content-Type": "application/json",
        },
        status: 200, // OK status
      });
    } else {
      // If no match is found, return a 404 Not Found response
      return new NextResponse("No match found with the given code", { status: 404 });
    }
  } catch (err) {
    // Log the error and return a 500 Internal Server Error response
    console.error("Error fetching match:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
