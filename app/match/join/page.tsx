"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

function JoinPage() {
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(`/match/${code}`);
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center text-2xl">
      <div>Enter your code</div>
      <form onSubmit={handleSubmit}>
        <input className="border" placeholder="enter your code..." value={code} onChange={(e) => setCode(e.target.value)} />
        <button type="submit">Go</button>
      </form>
    </div>
  );
}

export default JoinPage;
