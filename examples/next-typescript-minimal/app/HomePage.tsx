"use client";

import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
import { app } from "../firebase";

interface HomePageProps {
  email?: string;
}

export default function HomePage({ email }: HomePageProps) {
  const router = useRouter();

  async function handleLogout() {
    await signOut(getAuth(app));

    await fetch("/api/logout");

    router.push("/login");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-xl mb-4">Super secure home page</h1>
      <p className="mb-8">
        Only <strong>{email}</strong> holds the magic key to this kingdom!
      </p>
      <button
        onClick={handleLogout}
        className="text-white bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-primary-800"
      >
        Logout
      </button>
    </main>
  );
}
