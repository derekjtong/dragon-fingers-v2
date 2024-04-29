"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

function JoinPage() {
  const [code, setCode] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (code == "") {
      setError("Ask your friend for their room code!");
      return;
    }
    try {
      const response = await axios.get(`/api/match/${code}`);
      if (response.status === 200) {
        router.push(`/match/${code}`);
      } else {
        setError("Match not found");
      }
    } catch (error: any) {
      if (error.response) {
        setError(`${error.response.data}`);
      } else if (error.request) {
        setError("No response was received");
      } else {
        setError(`An error occurred: ${error.message}`);
      }
    }
  };

  return (
    <div className="flex h-screen flex-col items-center justify-evenly text-2xl">
      <div className="text-4xl">Join a game</div>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <input type="text" className="border" placeholder="Paste your code here" value={code} onChange={(e) => setCode(e.target.value)} />
        <button type="submit" className="border p-3 hover:bg-gray-300">
          Join
        </button>
      </form>
      <div className="text-red-500">{error}</div>
    </div>
  );
}

export default JoinPage;
