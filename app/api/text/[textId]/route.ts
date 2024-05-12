import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

interface IParams {
  textId: string;
}

export async function GET(request: Request, { params }: { params: IParams }) {
  try {
    const { textId } = params;

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

    // Check if missing text
    if (!text) {
      return new NextResponse("No text found with the given id", { status: 404 });
    }

    return NextResponse.json(text);
  } catch (error) {
    console.error("Error fetching text:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
