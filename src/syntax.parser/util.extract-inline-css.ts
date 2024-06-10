export function extractInlineCss(content: string): string {
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
