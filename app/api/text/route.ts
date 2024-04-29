import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Attempt to retrieve the all text records from the database
    const text = await prisma.text.findMany();

    // If no texts are found, return a 204 No Content response
    if (!text) {
      return new NextResponse(null, { status: 204 });
    }

    // Return the text in JSON format
    return NextResponse.json(text);
  } catch (error) {
    console.error("Failed to retrieve text:", error);
    return new NextResponse("Internal Error", {
      status: 500,
    });
  }
}
