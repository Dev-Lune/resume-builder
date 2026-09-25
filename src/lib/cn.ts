import { twMerge } from "tailwind-merge";

/** Join class names and resolve Tailwind conflicts (last one wins), so
    `buttonClass(...)` + "hidden lg:inline-flex" really hides below lg. */
export const cn = (...c: Array<string | false | null | undefined>) => twMerge(c.filter(Boolean).join(" "));
