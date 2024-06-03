/**
 * @type {import("stylelint").Config}
 */
module.exports = {
  extends: ["stylelint-config-recommended", "stylelint-css-in-js-syntax"],
  plugins: ["stylelint-no-unsupported-browser-features"],

  allowEmptyInput: true,

  rules: {
    "plugin/no-unsupported-browser-features": [
      true,
      {
        ignore: [
          "css3-cursors", // Safari on iOS doesn't support cursors (it's touch based - ignore the error)
          "css-nesting", // We're using css-in-js, and as such the css won't be output as css-nesting
        ],
        severity: "warning",
      },
    ],
    "length-zero-no-unit": [true, { ignore: "custom-properties" }],
    "alpha-value-notation": "number",

    "media-feature-range-notation": "prefix",
    "custom-property-pattern": null,

    // we ship our own CSS-in-JS formatting, and as such we disable built-in
    // stylelint formatting.
    "rule-empty-line-before": null,
    "declaration-empty-line-before": null,
  },
};
