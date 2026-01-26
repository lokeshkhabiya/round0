import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
    ),
  {
    rules: {
        "react-hooks/rules-of-hooks": "warn",
        "react-hooks/exhaustive-deps": "off",
        "@typescript-eslint/ban-ts-comment": [
            "warn",
            {
                "ts-expect-error": "allow-with-description",
                "minimumDescriptionLength": 3
            }
        ],
        "react/jsx-key": "warn",
        "@next/next/no-img-element": "off",
        "react/no-unescaped-entities": "off",
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/no-unused-vars": "off"
    }
  }
];

export default eslintConfig;
