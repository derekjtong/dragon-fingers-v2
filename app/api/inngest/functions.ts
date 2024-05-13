import { inngestClient } from "@/app/libs/inngest";
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";

export const triggerGameEnd = inngestClient.createFunction(
  {
    id: "trigger-game-end",
    cancelOn: [
      {
        event: "match/schedule-end.cancel",
        matchId: "data.matchId",
      },
    ],
  },
  {
    event: "match/schedule-end",
  },
  async ({ event, step }) => {
    const matchId = event.data.matchId;
    const seconds = event.data.seconds;

    if (!matchId || !/^[0-9a-fA-F]{24}$/.test(matchId)) {
      throw new Error("Invalid match format");
    }

    const match = await prisma.match.findUnique({
      where: {
        id: matchId,
      },
    });

    if (!match) {
      throw new Error("Match not found");
    }

    const update: MatchUpdateMessage = {
      name: "admin",
      userId: "whatever",
      charCount: 0,
      status: "closed",
    };

    await step.sleep("wait-a-moment", `${seconds}s`);

    const endTime = new Date();

    await pusherServer.trigger(matchId, "progress-update", update);

    await prisma.match.update({
      where: {
        id: matchId,
      },
      data: {
        endTime: endTime,
        allowJoin: false,
      },
    });

    return { event, body: "Ending match" };
  },
);
