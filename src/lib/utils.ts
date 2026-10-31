import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { IdentifierType } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Masks an identifier for privacy protection before sufficient consensus is established.
 */
export function maskIdentifier(value: string, type?: IdentifierType): string {
  if (!value) return "";
  const clean = value.trim();

  // If already looks masked (e.g. 98XXXXX210)
  if (clean.includes("XXXXX") || clean.includes("***")) {
    return clean;
  }

  // Phone number (10 digits or with +91)
  const phoneDigits = clean.replace(/\D/g, "");
  if (phoneDigits.length >= 10 || type === "phone") {
    const last10 = phoneDigits.slice(-10);
    if (last10.length === 10) {
      return `${last10.slice(0, 2)}XXXXX${last10.slice(-3)}`;
    }
  }

  // UPI ID (e.g. name@bank)
  if (clean.includes("@") || type === "upi") {
    const [user, handle] = clean.split("@");
    if (user && handle) {
      const maskedUser = user.length > 2 
        ? `${user[0]}***${user[user.length - 1]}`
        : `${user[0]}***`;
      return `${maskedUser}@${handle}`;
    }
  }

  // Link / URL
  if (clean.startsWith("http") || clean.includes(".") || type === "link") {
    try {
      const domain = clean.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split("/")[0];
      return domain;
    } catch {
      return clean;
    }
  }

  // SMS sender ID (e.g. AX-HDFCBK or ALERT123)
  if (clean.length <= 11) {
    return clean.toUpperCase();
  }

  return clean.slice(0, 3) + "***" + clean.slice(-2);
}

/**
 * Detects the probable type of an identifier entered by a user.
 */
export function detectIdentifierType(input: string): IdentifierType {
  const clean = input.trim();
  const digitsOnly = clean.replace(/\D/g, "");

  if (digitsOnly.length === 10 || (digitsOnly.length > 10 && clean.startsWith("+"))) {
    return "phone";
  }
  if (clean.includes("@")) {
    return "upi";
  }
  if (clean.startsWith("http://") || clean.startsWith("https://") || clean.includes(".com") || clean.includes(".in") || clean.includes(".net") || clean.includes(".xyz")) {
    return "link";
  }
  if (/^[a-zA-Z0-9-]{3,11}$/.test(clean)) {
    return "sms";
  }
  return "other";
}
