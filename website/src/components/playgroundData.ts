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

export const CUSTOM_CASES = {
  readmore: {
    label: "Words",
    method: "truncateByWidth",
    text: "When product copy needs a continuation affordance, the truncation token can be words instead of punctuation. The UI can fade the clipped copy and then show READ MORE as the continuation.",
    marker: " READ MORE",
    width: 280,
    preview: [],
  },
  gif: {
    label: "🐈 GIF",
    method: "truncateMiddle",
    text: "Campaign URL: https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif?cid=truncate-playground&rid=giphy.gif&ct=g",
    marker: " 🐈 ",
    width: 300,
    markerVisual: {
      kind: "image",
      label: "GIPHY GIF",
      src: "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif",
    },
  },
  media: {
    label: "🎬 Video",
    method: "truncateMiddle",
    text: "CDN queue: https://res.cloudinary.com/demo/video/upload/q_auto:good,w_1280/dog.mp4 is ready beside https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/sample.jpg",
    marker: " 🎬 ",
    width: 300,
    markerVisual: {
      kind: "video",
      label: "Cloudinary video",
      src: "https://res.cloudinary.com/demo/video/upload/q_auto:good,w_1280/dog.mp4",
    },
  },
  emoji: {
    label: "🙂 Safe emoji",
    method: "truncateByWidth",
    text: "Status update: safe emoji 🙂 🚀 ⭐ ✨ should stay whole when the copy is measured and shortened",
    marker: " 🙂",
    width: 230,
    preview: [],
  },
} as const;

export const CUSTOM_CASE_NAMES = ["readmore", "gif", "media", "emoji"] as const;

export function short(s: string, n = 40): string {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

export const wVal = (v: number, u: string) => (u === "px" ? v : `${v}${u}`);
export const wDsp = (v: number, u: string) => (u === "px" ? `${v}` : `"${v}${u}"`);
