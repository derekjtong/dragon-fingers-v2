import { Match } from "@prisma/client";
import axios from "axios";
import { useEffect, useState } from "react";
import { pusherClient } from "../libs/pusher";

interface PusherProgressProps {
  match: Match;
  setGameStatus: (status: GameStatus) => void;
}

type Winner = { id: string; name: string };

function usePusherProgress({ match, setGameStatus }: PusherProgressProps) {
  const [participantProgress, setParticipantProgress] = useState<MatchUpdateMessage[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(match.startTime);
  const [winner, setWinner] = useState<Winner>();

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
          setGameStatus("open");
        }
        if (update.status == "starting") {
          setGameStatus("starting");
        }
        if (update.status == "inprogress") {
          setGameStatus("inprogress");
        }
        if (update.status == "ended") {
          setGameStatus("ended");
        }
        if (update.winnerId !== "") {
          setWinner({ id: update.winnerId, name: update.winnerName });
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
  }, [match.id, startTime, setGameStatus, winner]);

  return { participantProgress, startTime, winner };
}

export default usePusherProgress;
