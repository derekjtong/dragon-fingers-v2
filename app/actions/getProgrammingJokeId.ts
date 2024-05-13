import prisma from "@/app/libs/prismadb";
import axios from "axios";

const getProgrammingJoke = async () => {
  const url = "https://v2.jokeapi.dev/joke/Programming?blacklistFlags=nsfw,religious,political,racist,sexist,explicit";

  try {
    // Fetch the joke from the Joke API
    const response = await axios.get(url);
    const jokeData = await response.data;

    const jokeText = jokeData.setup ? `${jokeData.setup} ${jokeData.delivery}` : jokeData.joke;

    // Check if the joke already exists in the database
    const existingText = await prisma.text.findFirst({
      where: {
        body: jokeText,
      },
    });

    if (existingText) {
      return existingText;
    } else {
      // If the joke does not exist, create a new record
      const newText = await prisma.text.create({
        data: {
          body: jokeText,
          source: "Joke API",
        },
      });

      return newText;
    }
  } catch (error) {
    console.error("Failed to fetch or process joke:", error);
    throw new Error("Failed to process the joke request.");
  }
};

export default getProgrammingJoke;
