import prisma from "@/app/libs/prismadb";

const getTexts = async () => {
  try {
    const allTexts = await prisma.text.findMany();
    const texts = allTexts.filter((text) => text.body.length <= 70);
    return texts;
  } catch (error: any) {
    return [];
  }
};

export default getTexts;
