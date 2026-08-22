import passportsByEmailJson from "../data/passports-by-email.json";

export type PassportGuest = {
  firstName: string;
  lastName: string;
  passportId: string;
  passportUrl: string;
  cursorReferralUrl?: string;
  cursorCode?: string;
};

type PassportMap = Record<string, PassportGuest>;

const passportsByEmail = passportsByEmailJson as PassportMap;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function lookupPassportByEmail(email: string): PassportGuest | undefined {
  return passportsByEmail[normalizeEmail(email)];
}
