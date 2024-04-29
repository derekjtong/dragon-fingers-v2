"use client";
import axios from "axios";
import { useRouter } from "next/navigation";

function CreatePage() {
  const router = useRouter();
  const handleClick = async () => {
    try {
      const response = await axios.get("/api/match/new");
      const match = response.data;
      router.push(`/match/${match.id}`);
    } catch (error) {
      console.error("Error creating match:", error);
      alert("Failed to create match!");
    }
  };
  return (
    <div className="flex h-screen flex-col items-center justify-center ">
      <div className="mb-2 p-3 text-2xl">Match Settings</div>
      <div>Option 1</div>
      <div>Option 2</div>
      <div>Option 3</div>
      <button className="mt-10 p-3 text-2xl hover:bg-gray-300" onClick={handleClick}>
        Create Match
      </button>
    </div>
  );
}

export default CreatePage;
