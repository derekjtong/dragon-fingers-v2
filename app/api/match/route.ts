import getAllMatches from "@/app/actions/getAllMatches";
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
