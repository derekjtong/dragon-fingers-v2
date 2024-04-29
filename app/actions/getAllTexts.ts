import prisma from "@/app/libs/prismadb";

const getTexts = async () => {
  try {
    const texts = await prisma.text.findMany();
    return texts;
  } catch (error: any) {
    return [];
  }
};

export default getTexts;
