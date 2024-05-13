import { inngestClient } from "@/app/libs/inngest";
import { serve } from "inngest/next";
import { triggerGameEnd, triggerGameStart } from "./functions";

export const { GET, POST, PUT } = serve({
  client: inngestClient,
  functions: [triggerGameEnd, triggerGameStart],
});
