import { inngestClient } from "@/app/libs/inngest";
import { serve } from "inngest/next";
import { triggerGameEnd } from "./functions";

export const { GET, POST, PUT } = serve({
  client: inngestClient,
  functions: [triggerGameEnd],
});
