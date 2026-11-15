"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, fieldErrorId } from "@/components/ui/field";
import { inputClassName } from "@/components/ui/input";
import { useUpdateAccount } from "@/features/admin/hooks/use-admin";
import { noteSchema, type NoteValues } from "@/features/admin/schemas";
import type { AccountDetails } from "@/features/admin/types";
import { useErrorText } from "@/hooks/use-error-text";
import { useT } from "@/hooks/use-t";
import { NOTE_MAX_LENGTH } from "@/lib/constants";
import { cn } from "@/lib/utils";

const VIP_ID = "account-vip";
const NOTE_ID = "account-note";

/** The admin-only controls for one account: the VIP plan and a private comment. */
export function AccountSettings({ account }: { account: AccountDetails }) {
  const t = useT();
  const errorText = useErrorText();
  const vip = useUpdateAccount(account.id);
  // Local copy so the switch responds at once; a failed save puts it back.
  const [isVip, setIsVip] = useState(account.isVip);
  const note = useUpdateAccount(account.id);
  const pin = useUpdateAccount(account.id);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<NoteValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: { note: account.note },
  });

  const noteError =
    errorText(errors.note?.message) ?? (note.isError ? t.errors.generic : undefined);

  return (
    <Card role="region" aria-labelledby="settings-title" className="flex flex-col gap-4">
      <h2 id="settings-title" className="text-xl font-black">
        {t.admin.settingsTitle}
      </h2>

      <div className="flex flex-col gap-1">
        <label
          htmlFor={VIP_ID}
          className="border-line flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 font-extrabold"
        >
          <input
            id={VIP_ID}
            type="checkbox"
            className="accent-primary size-6"
            checked={isVip}
            disabled={vip.isPending}
            aria-describedby={`${VIP_ID}-hint`}
            onChange={(event) => {
              const next = event.target.checked;
              setIsVip(next);
              vip.mutate({ isVip: next }, { onError: () => setIsVip(!next) });
            }}
          />
          {t.admin.vipLabel}
        </label>
        <p id={`${VIP_ID}-hint`} className="text-ink-soft text-sm font-bold">
          {t.admin.vipHint}
        </p>
        {vip.isError && (
          <p role="alert" className="text-coral text-sm font-bold">
            {t.errors.generic}
          </p>
        )}
      </div>

      <form
        noValidate
        onSubmit={handleSubmit((values) =>
          note.mutate(values, { onSuccess: () => reset(values) }),
        )}
        className="flex flex-col gap-3"
      >
        <Field label={t.admin.noteLabel} htmlFor={NOTE_ID} error={noteError}>
          <textarea
            id={NOTE_ID}
            rows={3}
            maxLength={NOTE_MAX_LENGTH}
            placeholder={t.admin.notePlaceholder}
            aria-invalid={noteError !== undefined}
            aria-describedby={noteError ? fieldErrorId(NOTE_ID) : undefined}
            className={cn(inputClassName, "py-3 font-semibold")}
            {...register("note")}
          />
        </Field>
        <div className="flex items-center gap-3">
          <Button type="submit" variant="secondary" disabled={note.isPending || !isDirty}>
            {note.isPending ? t.common.loading : t.admin.noteSave}
          </Button>
          {note.isSuccess && !isDirty && (
            <p
              role="status"
              data-testid="note-saved"
              className="text-mint font-extrabold"
            >
              {t.admin.noteSaved}
            </p>
          )}
        </div>
      </form>

      <div className="border-line flex flex-col gap-2 border-t-2 pt-4">
        <p data-testid="pin-status" className="font-extrabold">
          {account.hasParentPin ? t.admin.pinSet : t.admin.pinNotSet}
        </p>
        {account.hasParentPin && (
          <>
            <Button
              variant="secondary"
              size="sm"
              className="self-start"
              disabled={pin.isPending}
              onClick={() => pin.mutate({ resetParentPin: true })}
            >
              {t.admin.pinReset}
            </Button>
            <p className="text-ink-soft text-sm font-bold">{t.admin.pinResetHint}</p>
          </>
        )}
        {pin.isError && (
          <p role="alert" className="text-coral text-sm font-bold">
            {t.errors.generic}
          </p>
        )}
      </div>
    </Card>
  );
}
