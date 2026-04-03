import { Outlet, redirect } from "react-router";
import { Navbar } from "../components/Navbar";
import { apiFetch, getCachedUser, setCachedUser } from "../utils/api";
import type { Route } from "./+types/student-layout";

export function meta() {
  return [{ title: "بوابة الطالب | Quizaty" }];
}

export async function clientLoader() {
  const cached = getCachedUser();
  if (cached) {
    if (cached.user?.role !== "student") {
      throw redirect("/login");
    }
    return { user: cached.user };
  }
  
  try {
    const data = await apiFetch("/auth/me");
    if (data.user?.role !== "student") {
      throw redirect("/login");
    }
    setCachedUser(data.user);
    return { user: data.user };
  } catch (err: any) {
    if (err instanceof Response) throw err;
    throw redirect("/login");
  }
}

export default function StudentLayout({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;

  return (
    <>
      <Navbar userName={user.name} role="student" />
      <main className="max-w-6xl mx-auto px-6 py-12 opacity-0 animate-reveal-up">
        <Outlet context={{ user }} />
      </main>
    </>
  );
}
