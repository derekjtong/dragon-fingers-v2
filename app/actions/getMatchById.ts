import prisma from "@/app/libs/prismadb";

const getMatchById = async (matchId: string) => {
  try {
    const match = await prisma.match.findUnique({
      where: {
        id: matchId,
      },
    });
    if (!match) throw new Error("Match not found");
    return match;
  } catch (error: any) {
    console.error("Failed to fetch match:", error.message);
    throw error;
  }
};

export default getMatchById;
