import { all as cssProperties } from "known-css-properties";

import { getPreviousWord } from "../util.get-previous-word";

const NEW_STATEMENT_INDICATORS = [":", "{", "@", "&"];

export /**
 * unclosed delcarations will cause the VSCode stylelint plugin to throw errors
 * whenever unclosed declarations are followed by rules, queries or similar
 * content.
 *
 * This function attempts to close all unclosed declarations to avoid such
 * unnecessary (and annoying!) errors being logged on each keystroke before
 * declarations are closed.
 *
 * @example
 * css```
 *    width: fit-
 *
 *    .${selector} {}
 * ```
 *
 * will be transformed into
 *
 * css```
 *    width: fit-;
 *
 *    .${selector} {}
 * ```
 */
function fixUnclosedDelcarations(content: string): string {
  let cssString = "";
  let isInsideComment = false;

  for (let cursor = 0; cursor < content.length; cursor++) {
    const currentChar = content[cursor];

    if (
      !isInsideComment &&
      currentChar === "/" &&
      content[cursor + 1] === "*"
    ) {
      isInsideComment = true;
    }

    if (
      !isInsideComment &&
      currentChar === ":" &&
      cssProperties.includes(getPreviousWord(content, cursor))
    ) {
      const correction = isDeclarationClosedCorrectly(content, cursor + 1);

      if (!correction.isClosedCorrectly) {
        cssString += content.substring(
          cursor,
          correction.canBeCorrectedAtIndex,
        );
        cssString += "/*__auto-close__*/;";
        cursor = correction.canBeCorrectedAtIndex - 1;

        continue;
      }
    }

    if (isInsideComment && currentChar === "*" && content[cursor + 1] === "/") {
      isInsideComment = false;
    }

    cssString += currentChar;
  }

  return cssString;
}

function isDeclarationClosedCorrectly(
  content: string,
  startIndex: number,
):
  | { isClosedCorrectly: true }
  | { isClosedCorrectly: false; canBeCorrectedAtIndex: number } {
  let isEvaluatingFontName = false;
  let firstNewlineIndex: number | undefined = undefined;

  for (
    let correctionCursor = startIndex;
    correctionCursor < content.length;
    correctionCursor++
  ) {
    const nextChar = content[correctionCursor] ?? "";

    if (!firstNewlineIndex && nextChar === "\n") {
      firstNewlineIndex = correctionCursor;
    }

    if (nextChar === ";") {
      return { isClosedCorrectly: true };
    }

    if (nextChar === `'` || nextChar === `"`) {
      isEvaluatingFontName = !isEvaluatingFontName;
    }

    if (!isEvaluatingFontName && NEW_STATEMENT_INDICATORS.includes(nextChar)) {
      return {
        isClosedCorrectly: false,
        canBeCorrectedAtIndex: firstNewlineIndex || correctionCursor,
      };
    }
  }

  return { isClosedCorrectly: true };
}
