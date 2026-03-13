import { Outlet } from "react-router";
import { Navbar } from "../components/Navbar";
import { apiFetch } from "../utils/api";
import type { Route } from "./+types/student-layout";

export function meta() {
  return [{ title: "بوابة الطالب | Quizaty" }];
}

export async function clientLoader() {
  try {
    const data = await apiFetch("/auth/me");
    if (data.user?.role !== "student") {
      throw new Response("Forbidden", { status: 403 });
    }
    return { user: data.user };
  } catch {
    throw new Response("", { status: 302, headers: { Location: "/login" } });
  }
}

export default function StudentLayout({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;

  return (
    <>
      <Navbar userName={user.name} role="student" />
      <main className="max-w-6xl mx-auto px-6 py-12">
        <Outlet context={{ user }} />
      </main>
    </>
  );
}
