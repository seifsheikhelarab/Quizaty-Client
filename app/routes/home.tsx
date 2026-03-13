import { redirect } from "react-router";

export function clientLoader() {
  return redirect("/login");
}

export default function Home() {
  return null;
}
