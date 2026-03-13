import { Outlet, useLoaderData } from "react-router";
import { Navbar } from "../components/Navbar";
import { apiFetch } from "../utils/api";
import type { Route } from "./+types/teacher-layout";

export async function clientLoader() {
  try {
    const data = await apiFetch("/auth/me");
    if (data.user.role !== "teacher") {
      throw new Response("Forbidden", { status: 403 });
    }
    return { user: data.user };
  } catch {
    throw new Response("", { status: 302, headers: { Location: "/login" } });
  }
}

export default function TeacherLayout({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  return (
    <>
      <Navbar userName={user.name} role="teacher" />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Outlet context={user} />
      </main>
    </>
  );
}
