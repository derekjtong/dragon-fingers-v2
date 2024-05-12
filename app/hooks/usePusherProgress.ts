import axios from "axios";
import { useEffect, useState } from "react";
import { pusherClient } from "../libs/pusher";

type GameStatus = "open" | "progress" | "closed" | "";

function usePusherProgress(matchId: string) {
  const [participantProgress, setParticipantProgress] = useState<MatchUpdateMessage[]>([]);
  const [status, setStatus] = useState<GameStatus>("");

  // Fetch initial participants
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await axios.get(`/api/match/${matchId}/participants`);
        const initialParticipants = response.data.map((participant: ExtendedParticipant) => ({
          name: participant.user.name,
          userId: participant.userId,
          charCount: participant.charCount,
          status: "",
        }));
        setParticipantProgress(initialParticipants);
      } catch (error) {
        console.error("Error fetching participants:", error);
      }
    };

    fetchParticipants();
  }, [matchId]);

  // Connect to Pusher channel
  useEffect(() => {
    const subscribeToProgress = () => {
      pusherClient.subscribe(matchId);
      const progressHandler = (update: MatchUpdateMessage) => {
        if (update.status == "open") {
          setStatus("open");
        }
        if (update.status == "progress") {
          setStatus("progress");
        }
        if (update.status == "closed") {
          setStatus("closed");
        }
        if (update.name === "admin") {
          return;
        }
        setParticipantProgress((prev) => {
          const index = prev.findIndex((p) => p.userId === update.userId);
          return index !== -1 ? [...prev.slice(0, index), update, ...prev.slice(index + 1)] : [...prev, update];
        });
      };
      pusherClient.bind("progress-update", progressHandler);
      return () => {
        pusherClient.unsubscribe(matchId);
        pusherClient.unbind("progress-update", progressHandler);
      };
    };
    subscribeToProgress();
  }, [matchId]);

  return { participantProgress, status };
}

export default usePusherProgress;
