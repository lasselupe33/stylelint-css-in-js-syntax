/**
 * @type {import("stylelint").Config}
 */
module.exports = {
  extends: ["stylelint-config-recommended"],
  plugins: [
    "stylelint-no-unsupported-browser-features",
    "stylelint-css-in-js-syntax",
  ],

  rules: {
    "plugin/no-unsupported-browser-features": [
      true,
      {
        ignore: [
          "css3-cursors", // Safari on iOS doesn't support cursors (it's touch based - ignore the error)
        ],
        severity: "warning",
      },
    ],

    "length-zero-no-unit": true,
  },
};
