// Utility functions for handling project colors

// Map of predefined color names to hex codes
const PREDEFINED_COLORS: Record<string, string> = {
  blue: '#3b82f6',
  purple: '#a855f7',
  green: '#22c55e',
  orange: '#f97316',
  pink: '#ec4899',
  cyan: '#06b6d4',
};

/**
 * Get the hex color from a color value (either predefined name or hex code)
 */
export function getProjectColor(color: string): string {
  if (color.startsWith('#')) {
    return color;
  }
  return PREDEFINED_COLORS[color] || PREDEFINED_COLORS.blue;
}

/**
 * Get CSS styles for a project badge based on its color
 */
export function getProjectBadgeStyles(color: string): React.CSSProperties {
  const hex = getProjectColor(color);
  return {
    backgroundColor: `${hex}33`, // 20% opacity
    color: hex,
    borderColor: `${hex}4D`, // 30% opacity
  };
}

/**
 * Get CSS styles for a project accent (like sidebar indicator)
 */
export function getProjectAccentStyle(color: string): React.CSSProperties {
  const hex = getProjectColor(color);
  return {
    backgroundColor: hex,
  };
}
