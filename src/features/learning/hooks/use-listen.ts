import { useCallback, useEffect, useRef, useState } from "react";

import {
  listenOnce,
  type ListenFailure,
} from "@/features/learning/lib/speech-recognition";

export type ListenState =
  | { status: "idle" }
  | { status: "listening" }
  | { status: "heard"; guesses: string[] }
  | { status: "failed"; reason: ListenFailure };

/** Microphone state for one speaking question. */
export function useListen() {
  const [state, setState] = useState<ListenState>({ status: "idle" });
  const cancelRef = useRef<(() => void) | null>(null);

  const start = useCallback(() => {
    cancelRef.current?.();
    // The app must not hear its own voice reading the word.
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setState({ status: "listening" });
    cancelRef.current = listenOnce({
      onHeard: (guesses) => setState({ status: "heard", guesses }),
      onFailure: (reason) => setState({ status: "failed", reason }),
    });
  }, []);

  // Stop the microphone when the question leaves the screen.
  useEffect(() => () => cancelRef.current?.(), []);

  return { state, start };
}
