import { SPEECH_RATE } from "@/lib/constants";

const PREFERRED_LANGS = ["en-GB", "en-US"] as const;

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  for (const lang of PREFERRED_LANGS) {
    const match = voices.find((voice) => voice.lang.replace("_", "-") === lang);
    if (match) return match;
  }
  return voices.find((voice) => voice.lang.toLowerCase().startsWith("en"));
}

/** Says an English word aloud with the browser's built-in voice. */
export function speak(text: string): void {
  if (!isSpeechSupported()) return;
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = pickVoice(synth.getVoices());
  utterance.lang = voice?.lang ?? PREFERRED_LANGS[0];
  if (voice) utterance.voice = voice;
  utterance.rate = SPEECH_RATE;
  synth.cancel();
  synth.speak(utterance);
}
