import { Match } from "@prisma/client";
import axios from "axios";
import { useEffect, useState } from "react";
import { pusherClient } from "../libs/pusher";

function usePusherProgress(match: Match) {
  const [participantProgress, setParticipantProgress] = useState<MatchUpdateMessage[]>([]);
  const [status, setStatus] = useState<GameStatus>(match.allowJoin ? "open" : !match.endTime ? "progress" : "closed");
  const [startTime, setStartTime] = useState<Date | null>(match.startTime);

  // Fetch initial participants
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await axios.get(`/api/match/${match.id}/participants`);
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
  }, [match.id]);

  // Connect to Pusher channel
  useEffect(() => {
    const subscribeToProgress = () => {
      pusherClient.subscribe(match.id);
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

      const startTimeHandler = (startTimeUpdate: MatchStartMessage) => {
        setStartTime(startTimeUpdate.startTime);
      };

      pusherClient.bind("startTime", startTimeHandler);
      pusherClient.bind("progress-update", progressHandler);
      return () => {
        pusherClient.unsubscribe(match.id);
        pusherClient.unbind("progress-update", progressHandler);
      };
    };
    subscribeToProgress();
  }, [match.id, startTime]);

  return { participantProgress, status, startTime };
}

export default usePusherProgress;
