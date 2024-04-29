import getCurrentUser from "@/app/actions/getCurrentUser";
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

    // Retrieve all matches
    const matches = await prisma.match.findMany();

    // Check if there are any matches
    if (matches.length === 0) {
      return new NextResponse("No matches available", {
        status: 404,
      });
    }

    // Select a random match from the list of matches
    const randomMatch = matches[Math.floor(Math.random() * matches.length)];

    // Return the random match
    return NextResponse.json(randomMatch);
  } catch (error: any) {
    return new NextResponse("Internal Error", {
      status: 500,
    });
  }
}
