type GamePageProps = {
  params: {
    gameId: string;
  };
};

function GamePage({ params }: GamePageProps) {
  return <div className="flex h-screen flex-col items-center justify-center text-2xl">Game {params.gameId}</div>;
}

export default GamePage;
