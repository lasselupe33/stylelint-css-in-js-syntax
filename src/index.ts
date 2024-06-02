import * as syntax from "./syntax.js";

export default {
  overrides: [
    {
      files: [
        "*.js",
        "**/.js",
        "**/*.jsx",
        "*.jsx",
        "**/*.ts",
        "*.ts",
        "**/*.tsx",
        "*.tsx",
      ],
      customSyntax: syntax,
      extends: ["stylelint-config-standard"],
      rules: {
        // We should allow stringified js expressions inside CSS.
        "property-no-unknown": [true, { ignoreProperties: /custom-js__/ }],

        // We may include js expressions as selectors, and the stringified
        // output should be allowed here.
        "selector-type-no-unknown": [true, { ignoreTypes: /custom-prop__/ }],

        // We use custom JS to define our fonts, and herein generics should be
        // provided
        "font-family-no-missing-generic-family-keyword": null,

        // Our stringified js relies on css comments in order to preserve the
        // JS source. We do not want Stylelint to interfere or attempt to format
        // this.
        "comment-whitespace-inside": null,

        // Our stringified js expressions do not follow a specific formatting,
        // and this should not raise an error.
        "value-keyword-case": ["lower", { ignoreKeywords: /custom-(js|prop)/ }],

        // our selectors will likely include js expressions, and as such
        // we cannot enforce this rule.
        "selector-class-pattern": null,
        "selector-type-case": ["lower", { ignoreTypes: /custom-(js|prop)/ }],

        // stringified js may be used for font-families, and this should be
        // allowed without raising any warnings.
        "font-family-name-quotes": null,

        // stringified js may be used for media queries, which renders this
        // rule useless as it cannot check for valid queries.
        "media-query-no-invalid": null,

        // in CSS-in-JS empty classes (i.e. css``) may be used for purposes
        // inside JS.
        "block-no-empty": null,

        // :global is frequently used in CSS-in-JS solutions to allow unscoped
        // css from being written from within the css`` directive
        "selector-pseudo-class-no-unknown": [
          true,
          {
            ignorePseudoClasses: ["global"],
          },
        ],
      },
    },
  ],
};
