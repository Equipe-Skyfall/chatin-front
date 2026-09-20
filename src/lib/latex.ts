const CODE_REGION = /(```[\s\S]*?(?:```|$)|~~~[\s\S]*?(?:~~~|$)|`[^`\n]*`)/g;

const BLOCK_MATH = /\\\[([\s\S]+?)\\\]/g;
const INLINE_MATH = /\\\(([\s\S]+?)\\\)/g;

function replaceMathDelimiters(text: string): string {
  return text
    .replace(BLOCK_MATH, (_match, content: string) => `\n$$\n${content.trim()}\n$$\n`)
    .replace(INLINE_MATH, (_match, content: string) => `$${content.trim()}$`);
}

export function normalizeMathDelimiters(markdown: string): string {
  return markdown
    .split(CODE_REGION)
    .map((part, index) => (index % 2 === 1 ? part : replaceMathDelimiters(part)))
    .join("");
}
