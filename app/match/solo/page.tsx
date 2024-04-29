"use client";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PuffLoader } from "react-spinners";

function SoloPage() {
  const [error, setError] = useState<string>("");
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchGame = async () => {
      if (session.status === "loading") {
        console.log("Session is loading");
        return;
      }
      if (session.status === "unauthenticated") {
        setError("Must be logged in");
        return;
      }

      console.log(session);
      try {
        const response = await axios.get("/api/match/new");
        const match = response.data;
        router.push(`/match/${match.id}`);
      } catch (error) {
        console.error("Error creating match:", error);
        setError("Failed to create match");
      }
    };
    fetchGame();
  });
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <PuffLoader />
    </div>
  );
}

export default SoloPage;
