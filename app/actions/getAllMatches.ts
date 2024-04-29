import prisma from "@/app/libs/prismadb";

const getAllMatches = async () => {
  try {
    const matches = await prisma.match.findMany();
    return matches;
  } catch (error: any) {
    return [];
  }
};

export default getAllMatches;
