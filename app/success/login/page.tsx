import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const SuccessPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  return (
    <div
      className="
        dark:bg-gray-900
        h-screen w-screen overflow-auto
        flex flex-col justify-center items-center gap-3
      "
    >
      <span className="text-5xl">
        Welcome back!
      </span>
      <span className="text-4xl">
        {session!.user.name}
      </span>
    </div>
  );
};


export default SuccessPage;