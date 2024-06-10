import * as syntax from "./syntax.js";

export default {
  overrides: [
    {
      files: [
        "**/*.js",
        "*.js",
        "**/*.jsx",
        "*.jsx",
        "**/*.mjs",
        "*.mjs",
        "**/*.cjs",
        "*.cjs",
        "**/*.ts",
        "*.ts",
        "**/*.tsx",
        "*.tsx",
        "**/*.mts",
        "*.mts",
      ],
      customSyntax: syntax,
      extends: ["stylelint-config-standard"],
      rules: {
        // We should allow stringified js expressions inside CSS.
        "property-no-unknown": [true, { ignoreProperties: /^ref/ }],

        // We may include js expressions as selectors, and the stringified
        // output should be allowed here.
        "selector-type-no-unknown": [true, { ignoreTypes: /^ref/ }],

        // We use custom JS to define our fonts, and herein generics should be
        // provided
        "font-family-no-missing-generic-family-keyword": null,

        // Our stringified js relies on css comments in order to preserve the
        // JS source. We do not want Stylelint to interfere or attempt to format
        // this.
        "comment-empty-line-before": null,
        "comment-whitespace-inside": null,

        // Our stringified js expressions do not follow a specific formatting,
        // and this should not raise an error.
        "value-keyword-case": null,

        // our selectors will likely include js expressions, and as such
        // we cannot enforce this rule.
        "selector-class-pattern": null,
        "selector-type-case": ["lower", { ignoreTypes: /^ref/ }],

        // stringified js may be used for font-families, and this should be
        // allowed without raising any warnings.
        "font-family-name-quotes": null,

        // stringified js may be used for media queries, which renders this
        // rule useless as it cannot check for valid queries.
        "media-query-no-invalid": null,

        // in CSS-in-JS empty classes (i.e. css``) may be used for purposes
        // inside JS.
        "block-no-empty": null,

        // custom js, stringified into ref-x_${expr}_ should be considered as a
        // valid unit, as we cannot infer its actual value.
        "unit-no-unknown": [
          true,
          {
            ignoreUnits: [/_|ˍ|，|.|꞉|⸨|⸩|❴|❵|⁅|⁆/],
          },
        ],

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
