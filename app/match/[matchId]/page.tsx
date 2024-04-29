import getMatchById from "@/app/actions/getMatchById";
import getTextById from "@/app/actions/getTextById";
import getUserById from "@/app/actions/getUserById";

type MatchPageProps = {
  params: {
    matchId: string;
  };
};

async function MatchPage({ params }: MatchPageProps) {
  const match = await getMatchById(params.matchId);
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

export default MatchPage;
