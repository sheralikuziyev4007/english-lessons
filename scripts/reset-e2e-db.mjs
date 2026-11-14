import { rmSync } from "node:fs";

// Cross-platform replacement for `rm -rf` (works in Windows shells too).
rmSync(new URL("../.pglite-e2e", import.meta.url), { recursive: true, force: true });
