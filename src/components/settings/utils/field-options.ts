// =============================================================================
// field-options — Runtime option lists for select fields
// No hardcoded state. Timezones from Intl API. Others are curated constants.
// =============================================================================

export interface SelectOption {
  label: string;
  value: string;
}

// ─── Timezones ────────────────────────────────────────────────────────────────
// Uses Intl.supportedValuesOf("timeZone") when available (Node 15+ / modern browsers).
// Falls back to a curated list for older environments.

const TIMEZONE_FALLBACK: SelectOption[] = [
  { value: "UTC",                     label: "UTC" },
  { value: "America/New_York",        label: "America/New_York (EST/EDT)" },
  { value: "America/Chicago",         label: "America/Chicago (CST/CDT)" },
  { value: "America/Denver",          label: "America/Denver (MST/MDT)" },
  { value: "America/Los_Angeles",     label: "America/Los_Angeles (PST/PDT)" },
  { value: "America/Toronto",         label: "America/Toronto" },
  { value: "America/Sao_Paulo",       label: "America/Sao_Paulo" },
  { value: "Europe/London",           label: "Europe/London (GMT/BST)" },
  { value: "Europe/Paris",            label: "Europe/Paris (CET/CEST)" },
  { value: "Europe/Berlin",           label: "Europe/Berlin" },
  { value: "Europe/Moscow",           label: "Europe/Moscow" },
  { value: "Asia/Dubai",              label: "Asia/Dubai (GST)" },
  { value: "Asia/Kolkata",            label: "Asia/Kolkata (IST)" },
  { value: "Asia/Singapore",          label: "Asia/Singapore (SGT)" },
  { value: "Asia/Tokyo",              label: "Asia/Tokyo (JST)" },
  { value: "Asia/Shanghai",           label: "Asia/Shanghai (CST)" },
  { value: "Australia/Sydney",        label: "Australia/Sydney (AEST/AEDT)" },
  { value: "Pacific/Auckland",        label: "Pacific/Auckland (NZST/NZDT)" },
];

function getTimezoneOptions(): SelectOption[] {
  try {
    const zones: string[] = (Intl as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf?.("timeZone") ?? [];
    if (zones.length > 0) {
      return zones.map((tz) => ({ value: tz, label: tz }));
    }
  } catch {
    // Intl.supportedValuesOf not supported — use fallback
  }
  return TIMEZONE_FALLBACK;
}

// ─── Currencies ───────────────────────────────────────────────────────────────

export const CURRENCIES: SelectOption[] = [
  { value: "USD", label: "USD — US Dollar"          },
  { value: "INR", label: "INR — Indian Rupee"       },
  { value: "EUR", label: "EUR — Euro"               },
  { value: "GBP", label: "GBP — British Pound"      },
  { value: "AUD", label: "AUD — Australian Dollar"  },
  { value: "CAD", label: "CAD — Canadian Dollar"    },
  { value: "JPY", label: "JPY — Japanese Yen"       },
  { value: "SGD", label: "SGD — Singapore Dollar"   },
  { value: "AED", label: "AED — UAE Dirham"         },
  { value: "CHF", label: "CHF — Swiss Franc"        },
  { value: "CNY", label: "CNY — Chinese Yuan"       },
  { value: "BRL", label: "BRL — Brazilian Real"     },
  { value: "MXN", label: "MXN — Mexican Peso"       },
  { value: "ZAR", label: "ZAR — South African Rand" },
];

// ─── Languages ────────────────────────────────────────────────────────────────

export const LANGUAGES: SelectOption[] = [
  { value: "en",    label: "English"             },
  { value: "hi",    label: "Hindi"               },
  { value: "fr",    label: "French"              },
  { value: "de",    label: "German"              },
  { value: "ja",    label: "Japanese"            },
  { value: "zh",    label: "Chinese (Simplified)"},
  { value: "es",    label: "Spanish"             },
  { value: "ar",    label: "Arabic"              },
  { value: "pt",    label: "Portuguese"          },
  { value: "ru",    label: "Russian"             },
];

// ─── Resolver ─────────────────────────────────────────────────────────────────

export function getOptionsForKey(
  key: "timezones" | "currencies" | "languages"
): SelectOption[] {
  switch (key) {
    case "timezones":  return getTimezoneOptions();
    case "currencies": return CURRENCIES;
    case "languages":  return LANGUAGES;
  }
}
