import prisma from "@/app/libs/prismadb";
const getTextById = async (textId: string) => {
  try {
    const text = await prisma.text.findUnique({
      where: {
        id: textId,
      },
    });
    return text;
  } catch (error: any) {
    return null;
  }
};

export default getTextById;
