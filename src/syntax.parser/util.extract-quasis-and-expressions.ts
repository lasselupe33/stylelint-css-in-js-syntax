export function extractQuasisAndExpressions(css: string): {
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
