import { Outlet, useLoaderData, redirect } from "react-router";
import { Navbar } from "../components/Navbar";
import { apiFetch, getCachedUser, setCachedUser } from "../utils/api";
import type { Route } from "./+types/teacher-layout";

export async function clientLoader() {
  const cached = getCachedUser();
  if (cached) {
    if (cached.user.role !== "teacher") {
      throw redirect("/login");
    }
    return { user: cached.user };
  }
  
  try {
    const data = await apiFetch("/auth/me");
    if (data.user.role !== "teacher") {
      throw redirect("/login");
    }
    setCachedUser(data.user);
    return { user: data.user };
  } catch (err: any) {
    if (err instanceof Response) throw err;
    throw redirect("/login");
  }
}

export default function TeacherLayout({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  return (
    <>
      <Navbar userName={user.name} role="teacher" />
      <main className="max-w-6xl mx-auto px-6 py-8 opacity-0 animate-reveal-up">
        <Outlet context={user} />
      </main>
    </>
  );
}
