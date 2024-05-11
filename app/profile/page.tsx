"use client";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function ProfilePage() {
  const [userData, setUserData] = useState<UserData>();
  const session = useSession();
  const router = useRouter();
  useEffect(() => {
    const fetchUserData = async () => {
      const response = await axios.get("/api/user");
      setUserData(response.data);
    };
    fetchUserData();
  }, []);
  if (session.status === "loading") return <div></div>;
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
