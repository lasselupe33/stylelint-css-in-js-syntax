export function restoreExpressions(rawCss: string) {
  const refs = rawCss.match(/\/\*refs (.*)\*\/$/)?.[1]?.split(";");

  if (!refs) {
    throw new Error(
      "restoreExpressions(): Expected refs comment to be included in source",
    );
  }

  return rawCss
    .replace(/ref-\d+:ignore_(.*?)_;?/gm, (replaceable) => {
      const refIndex = Number(replaceable.match(/ref-(\d+)/)?.[1]);
      const base64js = refs[refIndex] ?? "";
      const includeSemiColon = replaceable.trimEnd().endsWith(";");

      return `$\{${Buffer.from(base64js, "base64").toString("utf-8")}}${
        includeSemiColon ? ";" : ""
      }`;
    })
    .replace(/ref-\d+_(.*?)_/gm, (replaceable) => {
      const refIndex = Number(replaceable.match(/ref-(\d+)/)?.[1]);
      const base64js = refs[refIndex] ?? "";

      return `$\{${Buffer.from(base64js, "base64").toString("utf-8")}}`;
    });
}
