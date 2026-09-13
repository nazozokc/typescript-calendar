/** CSS プロパティのオブジェクト表現（style プロップ用） */
export type CSSProperties = Record<string, string | number | undefined>;

/** オブジェクト形式の style を style 属性文字列に変換する（camelCase → kebab-case） */
export function styleObjectToString(style: CSSProperties): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(style)) {
    if (value === undefined) continue;
    parts.push(
      `${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}: ${value}`,
    );
  }
  return parts.join("; ");
}
