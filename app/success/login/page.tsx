"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import crypto from "crypto";

const couchDbNameFromUserId = (userId: string) => {
  const hash = crypto
    .createHash("sha256")
    .update(userId)
    .digest("hex");
  return `u_${hash}`;
};

const SuccessPage = () => {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const signOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        }
      }
    });
  };

  return (
    <div
      className="
        dark:bg-gray-900
        h-screen w-screen overflow-auto
        flex flex-col justify-center items-center gap-3
      "
    >
      {session && (
        <>
          <span className="text-5xl">
            Welcome back!
          </span>
          <span className="text-4xl">
            {session.user.name}
          </span>
          <Button
            variant="secondary"
            className="py-6"
            onClick={signOut}
          >
            Sign Out
          </Button>
        </>
      )}
    </div>
  );
};

export default SuccessPage;