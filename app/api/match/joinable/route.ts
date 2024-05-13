import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const match = await prisma.match.findMany({
      where: {
        allowJoin: true,
      },
    });
    return NextResponse.json(match);
  } catch (error: any) {
    console.log("Failed to retrieve joinable matches:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
