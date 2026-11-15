"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, fieldErrorId } from "@/components/ui/field";
import { Input, inputClassName } from "@/components/ui/input";
import { UNITS } from "@/features/content";
import { useCreatePrize } from "@/features/overview/hooks/use-overview-mutations";
import { prizeSchema, type PrizeValues } from "@/features/overview/schemas";
import { useErrorText } from "@/hooks/use-error-text";
import { useLocalized } from "@/hooks/use-localized";
import { useT } from "@/hooks/use-t";
import { isApiError } from "@/lib/api-client";
import {
  DEFAULT_PRIZE_SCORE,
  MAX_PRIZE_SCORE,
  MIN_PRIZE_SCORE,
  PRIZE_TITLE_MAX_LENGTH,
} from "@/lib/constants";

const IDS = { unit: "prize-unit", title: "prize-title", score: "prize-score" } as const;
const DEFAULT_VALUES: PrizeValues = {
  unitId: "",
  title: "",
  minScore: DEFAULT_PRIZE_SCORE,
};

export function PrizeForm() {
  const t = useT();
  const localized = useLocalized();
  const errorText = useErrorText();
  const createPrize = useCreatePrize();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PrizeValues>({
    resolver: zodResolver(prizeSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const fieldErrors = {
    unit: errorText(errors.unitId?.message),
    title: errorText(errors.title?.message),
    score: errorText(errors.minScore?.message),
  };
  const serverError = createPrize.isError
    ? isApiError(createPrize.error, 409)
      ? t.errors.prizeExists
      : t.errors.generic
    : undefined;

  const describedBy = (id: string, error: string | undefined) =>
    error ? fieldErrorId(id) : undefined;

  return (
    <form
      noValidate
      aria-labelledby="prize-form-title"
      onSubmit={handleSubmit((values) =>
        createPrize.mutate(values, { onSuccess: () => reset(DEFAULT_VALUES) }),
      )}
      className="flex flex-col gap-4"
    >
      <h3 id="prize-form-title" className="text-lg font-black">
        {t.overview.prizeFormTitle}
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={t.overview.prizeUnit} htmlFor={IDS.unit} error={fieldErrors.unit}>
          <select
            id={IDS.unit}
            aria-invalid={fieldErrors.unit !== undefined}
            aria-describedby={describedBy(IDS.unit, fieldErrors.unit)}
            className={inputClassName}
            {...register("unitId")}
          >
            <option value="">{t.overview.prizeUnitPlaceholder}</option>
            {UNITS.map((unit, index) => (
              <option key={unit.id} value={unit.id}>
                {index + 1}. {localized(unit.title)}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label={t.overview.prizeScore}
          htmlFor={IDS.score}
          error={fieldErrors.score}
        >
          <Input
            id={IDS.score}
            type="number"
            inputMode="numeric"
            min={MIN_PRIZE_SCORE}
            max={MAX_PRIZE_SCORE}
            aria-invalid={fieldErrors.score !== undefined}
            aria-describedby={describedBy(IDS.score, fieldErrors.score)}
            {...register("minScore", { valueAsNumber: true })}
          />
        </Field>
      </div>
      <Field label={t.overview.prizeText} htmlFor={IDS.title} error={fieldErrors.title}>
        <Input
          id={IDS.title}
          maxLength={PRIZE_TITLE_MAX_LENGTH}
          placeholder={t.overview.prizeTextPlaceholder}
          aria-invalid={fieldErrors.title !== undefined}
          aria-describedby={describedBy(IDS.title, fieldErrors.title)}
          {...register("title")}
        />
      </Field>
      {serverError && (
        <p role="alert" className="text-coral text-sm font-bold">
          {serverError}
        </p>
      )}
      <Button type="submit" disabled={createPrize.isPending} className="self-start">
        {createPrize.isPending ? t.common.loading : t.overview.prizeAdd}
      </Button>
    </form>
  );
}
