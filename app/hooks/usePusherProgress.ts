import axios from "axios";
import { useEffect, useState } from "react";
import { pusherClient } from "../libs/pusher";

interface ParticipantProgress {
  name: string;
  userId: string;
  charCount: number;
  end: boolean;
}

function usePusherProgress(matchId: string) {
  const [participantProgress, setParticipantProgress] = useState<ParticipantProgress[]>([]);

  // Fetch initial participants
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await axios.get(`/api/match/${matchId}/participants`);
        const initialParticipants = response.data.map((participant: ExtendedParticipant) => ({
          name: participant.user.name,
          userId: participant.userId,
          charCount: 0,
          end: false,
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

  return participantProgress;
}

export default usePusherProgress;
