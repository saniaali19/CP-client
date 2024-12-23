import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { 
    files: ["**/*.js"],
    languageOptions: { 
      globals: globals.node, 
      sourceType: 'commonjs'  
    },
    rules: {
      'no-console': 'off',    
      'no-process-env': 'off' 
    }
  },
  pluginJs.configs.recommended
];