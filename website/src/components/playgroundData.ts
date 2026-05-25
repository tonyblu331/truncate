export const INSTALL = [
  { label: "pnpm", cmd: "pnpm add @tonybonet/truncate" },
  { label: "bun", cmd: "bun add @tonybonet/truncate" },
  { label: "npm", cmd: "npm install @tonybonet/truncate" },
  { label: "yarn", cmd: "yarn add @tonybonet/truncate" },
];

export const QUICK =
  "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!";

export const LONG =
  "Typography is the visual component of the written word. A text must be readable and legible. But more than that, it should convey the tone and voice of the message. The choice of typeface, the spacing between letters and lines, the measure of the column. All of these elements work together to create an experience for the reader. In digital interfaces, truncation becomes a necessary tool when this carefully crafted text exceeds its container. Good truncation preserves meaning while respecting layout constraints.";

export const TARGET_TEXT = "invoice #1042";

export const SEARCH_TEXT = `A long customer-support note can bury the useful part in routine context. Before the match there may be account notes, timestamps, copied chat history, shipping details, and unrelated troubleshooting steps. The customer is asking about ${TARGET_TEXT}, and the UI should keep that reference visible even when the card only has room for one short preview. After the match there may be agent notes, audit text, refund details, and follow-up tasks that still matter elsewhere but do not belong in this compact row.`;

export const LANGS: Record<string, string> = {
  english: "The quick brown fox jumps over the lazy dog.",
  spanish: "El veloz murciélago hindú comía feliz cardillo y kiwi.",
  german: "Victor jagt zwölf Boxkämpfer quer über den großen Sylter Deich.",
  russian: "Съешь ещё этих мягких французских булок, да выпей чаю.",
  thai: "เป็นมนุษย์สุดประเสริฐเลิศคุณค่า กว่าบรรดาฝูงสัตว์เดรัจฉาน",
  cjk: "天地玄黄宇宙洪荒日月盈昃辰宿列张寒来暑往秋收冬藏闰余成岁律吕调阳云腾致雨露结为霜金生丽水玉出昆冈剑号巨阙珠称夜光",
};

export const LANG_NAMES = ["english", "spanish", "german", "russian", "thai", "cjk"] as const;

export const SELS = ["body", "h1", "code"] as const;

export const FONT_MAP: Record<(typeof SELS)[number], string> = {
  body: "18px Geist",
  h1: "26px Geist",
  code: "13px Geist Mono",
};

export const SELECTORS = SELS.map((s) => ({ value: s, label: s }));

export const UNITS = ["px", "rem", "em", "ch", "vw", "vh", "vmin", "vmax"];

export function short(s: string, n = 40): string {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

export const wVal = (v: number, u: string) => (u === "px" ? v : `${v}${u}`);
export const wDsp = (v: number, u: string) => (u === "px" ? `${v}` : `"${v}${u}"`);
