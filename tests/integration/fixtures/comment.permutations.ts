//FILE: tests/integration/fixtures/comment.permutations.ts

import { createVirtualComment } from "../../../src/virtual_actions/kmjs.virtualAction.comment";
import type { CommentOptions } from "../../../src/virtual_actions/kmjs.virtualAction.comment";

/**
 * Generate permutations for Comment action testing.
 * Tests various combinations of title, text, and styled text options.
 */
export function generateCommentPermutations() {
  const titles = [
    "Simple Title",
    "EXAMPLE TITLE 1",
    "EXAMPLE TITLE 2",
    "",
    "Special <>&\"' Title",
  ];

  const texts = [
    "Simple comment text.",
    "Multiline\ncomment\ntext.",
    "Text with special chars: <>&\"'",
    "",
    "{\\rtf1 This looks like RTF but isn't}",
  ];

  const rtfVariants = [
    undefined,
    "{\\rtf1\\ansi\\deff0\\f0\\fs24 Custom RTF content}",
  ];

  const permutations: Array<{
    name: string;
    action: ReturnType<typeof createVirtualComment>;
    params: CommentOptions;
  }> = [];
  let i = 0;

  for (const title of titles) {
    for (const text of texts) {
      for (const rtfContent of rtfVariants) {
        const opts: CommentOptions = { title, text };
        if (rtfContent) opts.rtfContent = rtfContent;
        permutations.push({
          name: `Comment – Permutation ${i++}`,
          action: createVirtualComment(opts),
          params: opts,
        });
      }
    }
  }

  // Edge cases
  permutations.push({
    name: `Comment – Permutation ${i++}`,
    action: createVirtualComment({ title: "", text: "" }),
    params: { title: "", text: "" },
  });

  return permutations;
}
