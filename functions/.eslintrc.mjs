// module.exports = {
//   env: {
//     node: true,
//     es2021: true,
//   },
//   parserOptions: {
//     ecmaVersion: 2018,
//     sourceType: "module",
//   },
//   extends: ["eslint:recommended", "google"],
//   rules: {
//     "no-restricted-globals": ["error", "name", "length"],
//     "prefer-arrow-callback": "error",
//     "quotes": ["error", "double", { "allowTemplateLiterals": true }],
//   },
//   globals: {
//     process: "readonly", // 👈 add this line
//   },
// };

export default {
  env: {
    node: true, // Node.js globals
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
  },
  extends: ["eslint:recommended", "google"],
  globals: {
    process: "readonly", // 👈 tells ESLint process exists
  },
  rules: {
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    quotes: ["error", "double", { allowTemplateLiterals: true }],
  },
};
