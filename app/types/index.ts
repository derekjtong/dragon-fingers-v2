// Used when querying participant; will return selected fields from user relation
// See api/match/[matchId]/participants
type ExtendedParticipant = {
  id: string;
  matchId: string;
  userId: string;
  speed: number | null;
  accuracy: number | null;
  user: {
    name: string;
    image: string;
  };
};

// Progress message used in pusher channels
type ProgressUpdateType = {
  id: string;
  userId: string;
  wordCount: number;
};
