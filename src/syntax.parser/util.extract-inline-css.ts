export function extractInlineCss(content: string): string {
  let cssInJSOccurrence = 0;

  const surrounding = [] as Array<string>;
  const css = [] as string[];

  let current = "";

  let hasUnclosedBacktick = false;
  let isExtractingCss = false;
  let currentCssCommentType: "single-line" | "multi-line" | undefined =
    undefined;
  let expressionEvaluationIndentation = 0;

  for (let cursor = 0; cursor < content.length; cursor++) {
    const currentChar = content[cursor];

    if (
      !isExtractingCss &&
      !currentCssCommentType &&
      currentChar === "/" &&
      content[cursor + 1] === "*"
    ) {
      currentCssCommentType = "multi-line";
    }

    if (
      !isExtractingCss &&
      !currentCssCommentType &&
      currentChar === "/" &&
      content[cursor + 1] === "/"
    ) {
      currentCssCommentType = "single-line";
    }

    if (
      !hasUnclosedBacktick &&
      !currentCssCommentType &&
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

    if (currentChar === "`") {
      hasUnclosedBacktick = !hasUnclosedBacktick;
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

    if (
      currentCssCommentType === "multi-line" &&
      currentChar === "*" &&
      content[cursor + 1] === "/"
    ) {
      currentCssCommentType = undefined;
    }

    if (currentCssCommentType === "single-line" && currentChar === "\n") {
      currentCssCommentType = undefined;
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
