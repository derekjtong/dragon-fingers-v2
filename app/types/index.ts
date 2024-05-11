// Used when querying participant; will return selected fields from user relation
// See api/match/[matchId]/participants
type ExtendedParticipant = {
  id: string;
  matchId: string;
  userId: string;
  speed: number | null;
  accuracy: number | null;
  user: {
    id: string;
    name: string;
    image: string;
  };
};

// Progress message used in pusher channels
type MatchUpdateMessage = {
  name: string;
  userId: string;
  wordCount: number;
};

// User Data
// See api/user get
type UserData = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  isAdmin: boolean;
  averageSpeed: number;
  bestSpeed: number;
  matchesPlayed: number;
  matchesWon: number;
};
