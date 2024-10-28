export function stringifyExpressions(
  quasis: Array<{ value: { cooked: string } }>,
  expressions: string[],
) {
  let cssString = "";
  const refs = [] as string[];

  for (let i = 0; i < quasis.length; i++) {
    const currentQuasi = quasis[i]?.value.cooked;
    cssString += currentQuasi;

    const nextExpression = expressions[i];

    if (nextExpression) {
      const nearestChar = cssString?.replace(/\n/g, "").trimEnd().at(-1);
      const hasCommentBefore =
        `${cssString?.replace(/\n/g, "").trimEnd().at(-2)}${nearestChar}` ===
        "*/";
      const hasCommentBeforeOnSameLine =
        `${cssString.trimEnd().at(-2)}${nearestChar}` === "*/";

      const nextQuasi = quasis[i + 1]?.value.cooked.trimStart();

      const currentQuasiEndsWithNewLine = /\n( |\t\r)*?/.test(
        currentQuasi ?? "",
      );

      const base64Expression = Buffer.from(nextExpression).toString("base64");
      const refIndexToExpression = (() => {
        const existingIndex = refs.indexOf(base64Expression);

        if (existingIndex !== -1) {
          return existingIndex;
        } else {
          refs.push(base64Expression);
          return refs.length - 1;
        }
      })();

      const newlineCount = nextExpression.split("\n").length - 1;

      if (
        (!nearestChar ||
          ["{", ";", "}"].includes(nearestChar) ||
          (hasCommentBefore && !hasCommentBeforeOnSameLine)) &&
        !nextQuasi?.startsWith("{") &&
        !nextQuasi?.startsWith("&") &&
        !nextQuasi?.startsWith(".") &&
        !nextQuasi?.startsWith("[") &&
        !nextQuasi?.startsWith("$") &&
        nextQuasi !== "" &&
        ((currentQuasiEndsWithNewLine && !nextQuasi?.trim().startsWith(":")) ||
          nextQuasi?.startsWith("\n") ||
          nextQuasi?.startsWith(";"))
      ) {
        cssString += `ref-${refIndexToExpression}:ignore${"\n".repeat(newlineCount)}_${
          nextQuasi?.startsWith(";") || nextQuasi?.startsWith("{") ? "" : ";"
        }`;
      } else {
        const sanitizedExpression = sanitizeExpression(
          nextExpression,
        ).replaceAll("\n", "");

        cssString += `ref-${refIndexToExpression}_${sanitizedExpression}${"\n".repeat(newlineCount)}_`;
      }
    }
  }

  cssString += `/*refs ${refs.join(";")}*/`;

  return cssString;
}

function sanitizeExpression(expression: string): string {
  return expression
    .replaceAll(" ", "")
    .replaceAll("\n", "")
    .replaceAll(/[^A-Za-z\d]/g, ($1) => `\\${$1}`)
    .replaceAll("\\_", "ˍ")
    .replaceAll("\\.", ".")
    .replaceAll("\\:", "꞉")
    .replaceAll("\\,", "，")
    .replaceAll("\\(", "⸨")
    .replaceAll("\\)", "⸩")
    .replaceAll("\\{", "❴")
    .replaceAll("\\}", "❵")
    .replaceAll("\\[", "⁅")
    .replaceAll("\\]", "⁆");
}
