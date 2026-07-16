export function camelToKebab(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .toLowerCase();
}

export function kebabToCamel(value: string): string {
  return value.replace(/-([a-z0-9])/g, (_, letter: string) => letter.toUpperCase());
}

export function normalizeCustomElementName(tagName: string): string {
  const normalized = tagName.trim().toLowerCase();
  if (!/^[a-z][.0-9_a-z]*-[-.0-9_a-z]*$/.test(normalized)) {
    throw new Error(`Custom element names must be valid kebab-case names: "${tagName}".`);
  }
  return normalized;
}
