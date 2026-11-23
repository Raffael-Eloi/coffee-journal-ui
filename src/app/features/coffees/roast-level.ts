/** Badge class for a roast level. Falls back to the neutral badge for unknown values. */
export function roastBadgeClass(roastLevel: string): string {
  const level = roastLevel.toLowerCase();
  if (level.includes('light')) return 'badge badge-light';
  if (level.includes('dark')) return 'badge badge-dark';
  if (level.includes('medium')) return 'badge badge-medium';
  return 'badge';
}
