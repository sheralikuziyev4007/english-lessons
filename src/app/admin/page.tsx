import type { Metadata } from "next";

import { AdminScreen } from "@/features/admin/components/admin-screen";

export const metadata: Metadata = {
  title: "Admin",
  description: "All accounts, their results, comments and plans.",
};

export default function AdminPage() {
  return <AdminScreen />;
}
