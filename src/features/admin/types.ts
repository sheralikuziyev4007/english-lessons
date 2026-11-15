import type { Overview } from "@/features/overview/types";

export interface AccountDetails {
  id: number;
  name: string;
  /** VIP accounts have no daily limit on new lessons. */
  isVip: boolean;
  /** Private admin comment; never shown to the learner. */
  note: string;
  /** Whether the parent section of this account already has a PIN. */
  hasParentPin: boolean;
  createdAt: string;
}

export interface AccountSummary extends AccountDetails {
  lastActiveDay: string | null;
  lessonsDone: number;
}

/** Returned by GET /api/admin/accounts. */
export interface AccountsList {
  total: number;
  accounts: AccountSummary[];
}

export interface AccountUpdate {
  isVip?: boolean;
  note?: string;
  /** Removes the parent PIN so the parent can choose a new one. */
  resetParentPin?: true;
}

/** Returned by GET /api/admin/accounts/:id. */
export interface AccountOverview extends Overview {
  account: AccountDetails;
}
