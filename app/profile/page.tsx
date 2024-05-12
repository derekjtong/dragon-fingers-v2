"use client";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PuffLoader } from "react-spinners";

function ProfilePage() {
  const [userData, setUserData] = useState<UserData>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("/api/user");
        setUserData(response.data);
        setIsLoading(false);
      } catch (error: any) {
        setError("Error: " + error.response.data);
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  if (isLoading)
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <PuffLoader />
      </div>
    );

  if (error)
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="p-3 text-3xl">{error}</div>
        <Link href="/">
          <Button variant={"destructive"}>Return to home</Button>
        </Link>
      </div>
    );

  if (session.status === "unauthenticated") router.push("/");
  return (
    <>
      {session && (
        <div className="flex h-screen flex-col items-center justify-center">
          <div className="text-3xl">{session.data?.user?.name}&apos;s profile</div>
          <div className="text-xl">
            <div>Average WPM: 100</div>
            <div>ID: {userData?.id}</div>
            <div>Name: {userData?.name}</div>
            <div>Email: {userData?.email}</div>
            <div>Created: {userData?.createdAt}</div>
            <div>Is Admin: {userData?.isAdmin ? "Yes" : "No"}</div>
            <div>Average Speed: {userData?.averageSpeed}</div>
            <div>Best Speed: {userData?.bestSpeed}</div>
            <div>Matches Played: {userData?.matchesPlayed}</div>
            <div>Matches Won: {userData?.matchesWon}</div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProfilePage;
