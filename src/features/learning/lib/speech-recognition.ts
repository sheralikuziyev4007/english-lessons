/**
 * Minimal typings for the browser's SpeechRecognition (Web Speech API).
 * It is not in every TypeScript DOM library and is still prefixed in Chrome.
 */
interface RecognitionAlternative {
  transcript: string;
}

interface RecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  [index: number]: RecognitionAlternative;
}

interface RecognitionResultEvent {
  readonly results: { readonly length: number; [index: number]: RecognitionResult };
}

interface RecognitionErrorEvent {
  readonly error: string;
}

export interface Recognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: RecognitionResultEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  abort: () => void;
}

type RecognitionConstructor = new () => Recognition;

interface RecognitionWindow {
  SpeechRecognition?: RecognitionConstructor;
  webkitSpeechRecognition?: RecognitionConstructor;
}

function getConstructor(): RecognitionConstructor | undefined {
  if (typeof window === "undefined") return undefined;
  const source = window as unknown as RecognitionWindow;
  return source.SpeechRecognition ?? source.webkitSpeechRecognition;
}

/** Chrome, Edge and Safari can listen; Firefox cannot. */
export function isRecognitionSupported(): boolean {
  return getConstructor() !== undefined;
}

export type ListenFailure = "no-speech" | "blocked" | "failed";

export interface ListenHandlers {
  /** Every guess the recogniser made for what was said, best first. */
  onHeard: (guesses: string[]) => void;
  onFailure: (reason: ListenFailure) => void;
}

const RECOGNITION_LANG = "en-US";
const MAX_GUESSES = 5;
const BLOCKED_ERRORS = new Set(["not-allowed", "service-not-allowed", "audio-capture"]);

/**
 * Listens for one short utterance. Exactly one of the handlers is called.
 * Returns a function that cancels listening without calling a handler.
 */
export function listenOnce(handlers: ListenHandlers): () => void {
  const Constructor = getConstructor();
  if (!Constructor) {
    handlers.onFailure("failed");
    return () => undefined;
  }

  const recognition = new Constructor();
  let settled = false;
  const settle = (notify: () => void) => {
    if (settled) return;
    settled = true;
    notify();
  };

  recognition.lang = RECOGNITION_LANG;
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.maxAlternatives = MAX_GUESSES;

  recognition.onresult = (event) => {
    const result = event.results[0];
    const guesses: string[] = [];
    for (let index = 0; result && index < result.length; index += 1) {
      guesses.push(result[index].transcript);
    }
    settle(() => handlers.onHeard(guesses));
  };
  recognition.onerror = (event) => {
    if (event.error === "aborted") return;
    const reason = BLOCKED_ERRORS.has(event.error)
      ? "blocked"
      : event.error === "no-speech"
        ? "no-speech"
        : "failed";
    settle(() => handlers.onFailure(reason));
  };
  // Ending without a result or an error means nothing was understood.
  recognition.onend = () => settle(() => handlers.onFailure("no-speech"));

  try {
    recognition.start();
  } catch {
    settle(() => handlers.onFailure("failed"));
  }

  return () => {
    settled = true;
    recognition.abort();
  };
}
