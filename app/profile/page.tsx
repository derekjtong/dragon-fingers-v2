"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  if (!session) router.push("/");
  return (
    <>
      {session && (
        <div className="flex h-screen flex-col items-center justify-center">
          <div className="text-3xl">{session?.user?.name}&apos;s profile</div>
          <div className="text-xl">
            <div>Average WPM: 100</div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProfilePage;
