import rootPostcss, { ProcessOptions } from "postcss";

import { stringifyExpressions } from "./util.stringify-expressions";

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

const NEW_STATEMENT_INDICATORS = [":", "{", "@", "#", "&"];

/**
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

  for (let cursor = 0; cursor < content.length; cursor++) {
    const currentChar = content[cursor];

    if (currentChar === ":") {
      const correction = isDeclarationClosedCorrectly(content, cursor + 1);

      if (!correction.isClosedCorrectly) {
        cssString += content.substring(
          cursor,
          correction.canBeCorrectedAtIndex - 1,
        );
        cssString += ";";
        cursor = correction.canBeCorrectedAtIndex - 1;

        continue;
      }
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

function extractInlineCss(content: string): string {
  let cssInJSOccurrence = 0;

  const surrounding = [] as Array<string>;
  const css = [] as string[];

  let current = "";
  let isExtractingCss = false;
  let expressionEvaluationIndentation = 0;

  for (let cursor = 0; cursor < content.length; cursor++) {
    const currentChar = content[cursor];

    if (
      !isExtractingCss &&
      currentChar === "c" &&
      content.slice(cursor, cursor + 4) === "css`" &&
      content.slice(cursor - 1, cursor + 4) !== '"css`'
    ) {
      isExtractingCss = true;

      const newlineCount = current.split("\n").length - 1;
      surrounding.push(
        `/*___js___${Buffer.from(current).toString("base64")}___js-end___${"\n".repeat(newlineCount)}*/`,
      );
      current = "";

      cursor += 3;
      continue;
    }

    if (expressionEvaluationIndentation && currentChar === "{") {
      expressionEvaluationIndentation++;
    }

    if (
      !expressionEvaluationIndentation &&
      isExtractingCss &&
      currentChar === "$" &&
      content.slice(cursor, cursor + 2) === "${"
    ) {
      expressionEvaluationIndentation++;
      cursor += 1;
      current += "${";
      continue;
    }

    if (expressionEvaluationIndentation && currentChar === "}") {
      expressionEvaluationIndentation--;
    }

    if (
      isExtractingCss &&
      !expressionEvaluationIndentation &&
      currentChar === "`"
    ) {
      isExtractingCss = false;

      css.push(
        `/*___start___*/.css${cssInJSOccurrence++}{${current}}/*___end___*/`,
      );
      current = "";
      continue;
    }

    current += content[cursor];
  }

  const newlineCount = current.split("\n").length - 1;
  surrounding.push(
    `/*___js___${Buffer.from(current).toString("base64")}___js-end___${"\n".repeat(newlineCount)}*/`,
  );

  let cssString = "";

  for (let i = 0; i < surrounding.length; i++) {
    const currJS = surrounding[i];
    const nextCss = css[i];

    if (!currJS) {
      continue;
    }

    cssString += currJS;

    if (nextCss) {
      cssString += nextCss;
    }
  }

  return cssString;
}

function extractQuasisAndExpressions(css: string): {
  quasis: Array<{ value: { cooked: string } }>;
  expressions: string[];
} {
  const quasis = [] as Array<{ value: { cooked: string } }>;
  const expressions = [] as string[];

  let current = "";
  let indentation = 0;

  for (let cursor = 0; cursor < css.length; cursor++) {
    const currentChar = css[cursor];
    const nextChar = css[cursor + 1];

    if (!indentation && currentChar === "$" && nextChar === "{") {
      indentation++;

      quasis.push({ value: { cooked: current } });
      current = "";

      cursor += 1;
      continue;
    }

    if (indentation && currentChar === "{") {
      indentation++;
    }

    if (indentation && currentChar === "}") {
      indentation--;

      if (indentation === 0) {
        expressions.push(current);
        current = "";
        continue;
      }
    }

    current += css[cursor];
  }

  quasis.push({ value: { cooked: current } });

  return { quasis, expressions };
}
