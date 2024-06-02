import type { Builder, Root } from "postcss";

import { restoreExpressions } from "./util.restore-expressions";

export function stringifier(root: Root, builder: Builder) {
  const restoredCss = restoreExpressions(root.toString())
    .replaceAll(/\/\*___start___\*\/.css\d+?{/g, "css`")
    .replaceAll("}/*___end___*/", "`")
    .replaceAll(/\/\*___js___(.*?)___js-end___\n*\*\//gm, (replaceable) => {
      const base64js = replaceable
        .replace(/^\/\*___js___/, "")
        .replace(/___js-end___\n*\*\/$/gm, "");

      return Buffer.from(base64js, "base64").toString("utf-8");
    });

  builder(restoredCss, root.nodes[0]);
}
