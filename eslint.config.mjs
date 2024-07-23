import security from "eslint-plugin-security";
import noUnsafeInnerhtml from "eslint-plugin-no-unsafe-innerhtml";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [
    ...compat.extends("eslint:recommended"),
    security.configs.recommended,
    {
        plugins: {
            security,
            "no-unsafe-innerhtml": noUnsafeInnerhtml,
        },

        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.amd,
                ...globals.jquery,
                _: true,
                Backbone: true,
                google: true,
            },

            ecmaVersion: 6,
            sourceType: "module",
        },

        rules: {
            indent: ["error", 4],
            "linebreak-style": ["error", "unix"],

            "no-unused-vars": ["error", {
                vars: "all",
                args: "none",
            }],

            quotes: ["error", "single"],
            "security/detect-object-injection": "off",
            semi: ["error", "always"],
        },
    },
];