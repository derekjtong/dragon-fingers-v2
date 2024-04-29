import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

interface IParams {
  textId?: string;
}

export async function GET(request: Request, { params }: { params: IParams }) {
  try {
    const { textId: textId } = params;

    // Validate that textId is provided
    if (!textId) {
      // If no textId is provided, return a 400 Bad Request response
      return new NextResponse("Bad Request: textId is required", { status: 400 });
    }

    // Validate textId format
    if (!textId || !/^[0-9a-fA-F]{24}$/.test(textId)) {
      return new NextResponse("Text not found", { status: 400 });
    }

    // Fetch the text from the database using the provided textId
    const text = await prisma.text.findUnique({
      where: {
        id: textId,
      },
    });

    // Check if the text was found
    if (text) {
      // If found, return the text data in JSON format
      return new NextResponse(JSON.stringify(text), {
        headers: {
          "Content-Type": "application/json",
        },
        status: 200, // OK status
      });
    } else {
      // If no text is found, return a 404 Not Found response
      return new NextResponse("No text found with the given id", { status: 404 });
    }
  } catch (err) {
    // Log the error and return a 500 Internal Server Error response
    console.error("Error fetching text:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
