"use client";

import { Button } from "@/components/ui/button";
import { StateMessage } from "@/components/ui/state-message";
import { useT } from "@/hooks/use-t";

interface ErrorStateProps {
  onRetry: () => void;
  text?: string;
}

export function ErrorState({ onRetry, text }: ErrorStateProps) {
  const t = useT();

  return (
    <StateMessage
      role="alert"
      icon="🌧️"
      title={t.common.errorTitle}
      text={text ?? t.common.errorText}
      action={<Button onClick={onRetry}>{t.common.retry}</Button>}
    />
  );
}
