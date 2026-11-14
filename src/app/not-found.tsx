import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { StateMessage } from "@/components/ui/state-message";
import { ROUTES } from "@/lib/constants";

export default function NotFound() {
  return (
    <main id="main" className="flex flex-1 flex-col justify-center">
      <StateMessage
        icon="🧭"
        title="Page not found"
        text="Sahifa topilmadi."
        action={
          <Link href={ROUTES.home} className={buttonVariants({ size: "lg" })}>
            Home · Bosh sahifa
          </Link>
        }
      />
    </main>
  );
}
