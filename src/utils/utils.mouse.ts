//FILE: src/utils/utils.mouse.ts

import type {
  MouseButton,
  ClickKind,
} from "../virtual_actions/types/types.input";

/* ----------------------------- */
/* Mouse mappings
/* ----------------------------- */

export const BUTTON_INT: Record<MouseButton, number> = {
  Left: 0,
  Right: 1,
  Center: 2,
  Button4: 3,
  Button5: 4,
  Button6: 5,
};

export const CLICK_COUNT_INT: Record<
  Exclude<ClickKind, "Move" | "Release">,
  number
> = {
  Click: 1,
  DoubleClick: 2,
  TripleClick: 3,
};
