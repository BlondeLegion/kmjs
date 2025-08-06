//FILE: tests/integration/fixtures/return.permutations.ts

/**
 * Generates permutations for the Return virtual action.
 * We test a variety of string values, including empty, unicode, and long strings.
 */
import {
  createVirtualReturn,
  type ReturnActionOptions,
} from "../../../src/virtual_actions/kmjs.virtualAction.return";

const texts = [
  "", // empty string
  "ExampleString",
  "Unicode: 你好, мир, hello!",
  "Special chars: <>&\"'",
  "Long text: " + "A".repeat(1000),
];

export function generateReturnPermutations() {
  const perms: Array<{
    name: string;
    action: ReturnType<typeof createVirtualReturn>;
    params: any;
  }> = [];
  let i = 0;
  for (const text of texts) {
    const opts: ReturnActionOptions = { text };
    perms.push({
      name: `Return – Permutation ${i}`,
      action: createVirtualReturn(opts),
      params: opts,
    });
    i++;
  }
  return perms;
}
