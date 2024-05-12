"use client";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

function CreatePage() {
  const [error, setError] = useState<string>("");
  const session = useSession();
  const router = useRouter();

  const handleClick = async () => {
    if (session.status === "loading") {
      console.log("Session is loading");
      return;
    }
    if (session.status === "unauthenticated") {
      setError("Must be logged in");
      return;
    }

    try {
      const response = await axios.post("/api/match");
      const match = response.data;
      router.push(`/match/${match.id}`);
    } catch (error) {
      console.error("Error creating match:", error);
      setError("Failed to create match");
    }
  };
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="mb-2 p-3 text-2xl">Match Settings</div>
      <div>Difficulty</div>
      <div>Length</div>
      <div>Source</div>
      <button className="mt-10 p-3 text-2xl hover:bg-gray-300" onClick={handleClick}>
        Create Match
      </button>
      <div className="text-red-500">{error}</div>
    </div>
  );
}

export default CreatePage;
