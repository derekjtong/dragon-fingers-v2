"use client";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PuffLoader } from "react-spinners";

function ProfilePage() {
  const [userData, setUserData] = useState<UserData>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    async function fetchUserData() {
      try {
        const response = await axios.get("/api/user/self");
        setUserData(response.data);
        setIsLoading(false);
      } catch (error) {
        setError("Unable to load user data. Please try again.");
        setIsLoading(false);
      }
    }
    fetchUserData();
  }, [status, router]);

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete your account?");
    if (confirmed) {
      try {
        await axios.delete("/api/user/self");
        router.push("/");
      } catch (error) {
        alert("Failed to delete the account. Try again.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <PuffLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="p-3 text-3xl">{error}</div>
        <Button onClick={() => window.location.reload()} variant="default">
          Retry
        </Button>
      </div>
    );
  }

  if (!userData) {
    router.push("/");
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="p-3 text-3xl">{error}</div>
        No data
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 pt-20">
      <div className="w-full max-w-lg rounded-lg bg-white p-8 shadow-xl">
        <h1 className="mb-6 text-center text-3xl font-semibold">{session?.user?.name}&apos;s Profile</h1>
        <div className="space-y-3 text-lg">
          <div>
            <strong>Average WPM:</strong> 100
          </div>
          <div>
            <strong>ID:</strong> {userData.id}
          </div>
          <div>
            <strong>Name:</strong> {userData.name}
          </div>
          <div>
            <strong>Email:</strong> {userData.email}
          </div>
          <div>
            <strong>Created:</strong> {userData.createdAt}
          </div>
          <div>
            <strong>Is Admin:</strong> {userData.isAdmin ? "Yes" : "No"}
          </div>
          <div>
            <strong>Is Deleted:</strong> {userData.isDeleted ? "Yes" : "No"}
          </div>
          <div>
            <strong>Average Speed:</strong> {Math.round(userData.averageSpeed)}
          </div>
          <div>
            <strong>Best Speed:</strong> {Math.round(userData.bestSpeed)}
          </div>
          <div>
            <strong>Matches Played:</strong> {userData.matchesPlayed}
          </div>
          <div>
            <strong>Matches Won:</strong> {userData.matchesWon}
          </div>
        </div>
        <button
          className="mt-8 w-full rounded-md bg-red-600 py-2 text-white transition duration-300 hover:bg-red-700"
          onClick={handleDelete}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;
