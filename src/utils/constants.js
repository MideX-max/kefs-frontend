// KEFFI APARTMENT SUITES Constants & Brand Helpers

export const BRAND = {
  name: "KSA Concierge Services",
  shortName: "KSA",
  tagline: "Guest Registration & Access Management",
  address: "20B Keffi Street, off Awolowo Road, Ikoyi, Lagos",
  phone: "+234 704 362 3113",
  email: "ksaconciergeservices@gmail.com",
  securityGate: "Main Gatehouse Access Control • Station A",
  colors: {
    black: "#111111",
    gold: "#F3C428",
    goldHover: "#E5B41B",
    goldDark: "#B88E12",
    surface: "#F9FAFB"
  }
};

export const DEFAULT_FLATS = [
  "Azalea",
  "Beaumont",
  "Charleston",
  "Darwin"
];

export const ID_TYPES = [
  "International Passport",
  "National ID / NIN-related accepted document",
  "Driver's Licence",
  "Voter's Card"
];

// Helper to format date to DD/MM/YYYY matching physical pass
export function formatDatePass(dateStr) {
  if (!dateStr) return "DD/MM/YYYY";
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

// Helper to format date with time for badges and logs
export function formatDateTime(dateStr, timeStr) {
  const formattedDate = formatDatePass(dateStr);
  if (!timeStr) return formattedDate;
  return `${formattedDate} at ${timeStr}`;
}

export const DEFAULT_MANAGER_SIG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='70' viewBox='0 0 220 70'><path d='M20,48 C35,20 45,15 52,40 C58,60 52,65 65,30 C75,10 85,25 90,45 C95,58 110,35 125,25 C140,15 150,45 165,35 C175,28 185,42 205,30' fill='none' stroke='%23111111' stroke-width='2.2' stroke-linecap='round'/><path d='M30,52 C60,48 110,46 195,50' fill='none' stroke='%23111111' stroke-width='1.8' stroke-linecap='round'/><circle cx='180' cy='32' r='2' fill='%23111111'/></svg>";
