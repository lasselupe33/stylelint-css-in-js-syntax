import rootPostcss, { ProcessOptions } from "postcss";

import { stringifyExpressions } from "../util.stringify-expressions";

import { extractInlineCss } from "./util.extract-inline-css";
import { extractQuasisAndExpressions } from "./util.extract-quasis-and-expressions";
import { fixUnclosedDelcarations } from "./util.fix-unclosed-declarations";

const postcss = rootPostcss();

export function parser(content: string, opts: ProcessOptions) {
  const css = (() => {
    if (opts.from?.endsWith(".css")) {
      return content;
    }

    return extractInlineCss(content);
  })();

  const { quasis, expressions } = extractQuasisAndExpressions(css);

  const plainCssString = stringifyExpressions(quasis, expressions);
  const safeCssString = fixUnclosedDelcarations(plainCssString);

  const parsed = postcss.process(safeCssString, {
    from: opts.from,
    to: opts.to,
  }).root;

  return parsed;
}
