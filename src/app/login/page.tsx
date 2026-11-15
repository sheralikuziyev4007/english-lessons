import type { Metadata } from "next";

import { LoginScreen } from "@/features/auth/components/login-screen";

export const metadata: Metadata = {
  title: "Start",
  description: "Write your name and start learning English.",
};

export default function LoginPage() {
  return <LoginScreen />;
}
