import type { Metadata } from "next";

import { LoginScreen } from "@/features/auth/components/login-screen";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to the family English course.",
};

export default function LoginPage() {
  return <LoginScreen />;
}
