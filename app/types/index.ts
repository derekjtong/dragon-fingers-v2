// Used when querying participant; will return selected fields from user relation
// api/match/[matchId]/participants
type ExtendedParticipant = {
  id: string;
  matchId: string;
  userId: string;
  charCount: number;
  completed: boolean;
  time: number | null;
  wpm: number | null;
  accuracy: number | null;
  user: {
    id: string;
    name: string;
    image: string;
  };
};

type GameStatus = "" | "open" | "starting" | "inprogress" | "ended";

// Progress message used in pusher channels
// api/match/[matchId]
// api/match/[matchId]/participants
type MatchUpdateMessage = {
  name: string;
  userId: string;
  charCount: number;
  status: GameStatus;
  winnerId: string;
  winnerName: string;
};

type MatchStartMessage = {
  startTime: Date | null;
};

// User Data
// api/user
type UserData = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  isAdmin: boolean;
  isDeleted: boolean;
  averageSpeed: number;
  bestSpeed: number;
  matchesPlayed: number;
  matchesWon: number;
};
