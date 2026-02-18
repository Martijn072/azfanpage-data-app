// Manual position overrides where API data differs from practice
export const POSITION_OVERRIDES: Record<string, string> = {
  "T. Parrott": "Attacker",
  "Weslley Patati": "Attacker",
  "Ro-Zangelo Daal": "Attacker",
  "R. Daal": "Attacker",
};

export const getOverriddenPosition = (name: string, apiPosition: string): string =>
  POSITION_OVERRIDES[name] || apiPosition;
