import getMatchById from "@/app/actions/getMatchById";
import getTextById from "@/app/actions/getTextById";
import getUserById from "@/app/actions/getUserById";

interface MatchDetailProps {
  matchId: string;
}
async function MatchDetails({ matchId }: MatchDetailProps) {
  if (!matchId || !/^[0-9a-fA-F]{24}$/.test(matchId)) {
    return <div className="flex h-screen flex-col items-center justify-center ">Error: match not found</div>;
  }
  const match = await getMatchById(matchId);
  if (!match) return <div className="flex h-screen flex-col items-center justify-center ">Error: match not found</div>;
  const text = await getTextById(match.textId);
  const user = await getUserById(match.ownerId);

  if (!match || !text) {
    return <div className="flex h-screen flex-col items-center justify-center text-2xl">Loading...</div>;
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center ">
      <div className="text-2xl">{user?.name}&apos;s game</div>
      <div>Share this code with your friends: </div>
      <div>{match.id}</div>
      <div>{text.text}</div>
    </div>
  );
}

export default MatchDetails;
