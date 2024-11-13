module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    'max-len': ['error', {
      'code': 120,
      'ignoreComments': true,
      'ignoreStrings': true,
      'ignoreUrls': true,
      'ignoreRegExpLiterals': true,
      'ignoreTemplateLiterals': true
    }],
    eqeqeq: 'error',
    "@typescript-eslint/naming-convention": ["warn",
      {
        "selector": "class",
        "format": ["PascalCase"]
      },
      {
        "selector": "classMethod",
        "format": ["camelCase"],
        modifiers: ["private"],
        leadingUnderscore: "require"
      },
      {
        "selector": "classProperty",
        "format": ["snake_case"],
        modifiers: ["private"],
        leadingUnderscore: "require"
      },
      {
        "selector": "enum",
        "format": ["PascalCase"]
      },
      {
        "selector": "enumMember",
        "format": ["UPPER_CASE"]
      },
      {
        "selector": "function",
        "format": ["camelCase", "PascalCase"]
      },
      {
        "selector": "interface",
        "format": ["PascalCase"],
        suffix: ["Interface"]
      },
      {
        "selector": "parameter",
        "format": ['snake_case', "camelCase"]
      },
      {
        "selector": "import",
        "format": ["camelCase", "PascalCase"]
      },
      {
        "selector": "objectLiteralMethod",
        "format": ["camelCase"]
      },
      {
        "selector": "typeAlias",
        "format": ["PascalCase"],
        suffix: ["Type"],
      },
      {
        "selector": "typeMethod",
        "format": ["camelCase"],
      },
      {
        "selector": "typeParameter",
        "format": ["PascalCase", "camelCase"],
      },
      {
        "selector": "typeProperty",
        "format": ["camelCase", "snake_case"],
        "leadingUnderscore": "allow"
      },
      {
        "selector": "objectLiteralProperty",
        "format": ["camelCase", "PascalCase", "snake_case", "UPPER_CASE"],
        "leadingUnderscore": "allow"
      },
      {
        "selector": "variable",
        "format": ["snake_case", "camelCase"]
      },
      {
        "selector": "variable",
        modifiers: ['exported'],
        "format": ["UPPER_CASE"]
      },
    ],
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-empty-function': ['error', { allow: ['constructors'] }],
    '@typescript-eslint/array-type': 'error',
    '@typescript-eslint/adjacent-overload-signatures': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/ban-types': 'error',
    '@typescript-eslint/no-array-delete': 'error',
    '@typescript-eslint/no-confusing-non-null-assertion': 'error',
    '@typescript-eslint/no-duplicate-enum-values': 'error',
    '@typescript-eslint/no-duplicate-type-constituents': 'error',
    '@typescript-eslint/no-empty-interface': 'error',
    '@typescript-eslint/no-empty-object-type': 'error',
    '@typescript-eslint/no-extra-non-null-assertion': 'error',
    '@typescript-eslint/no-for-in-array': 'error',
    'no-implied-eval': 'off',
    '@typescript-eslint/no-implied-eval': 'error',
    '@typescript-eslint/no-misused-new': 'error',
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        'checksVoidReturn': false
      }
    ],
    '@typescript-eslint/no-mixed-enums': 'error',
    '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-require-imports': 'error',
    '@typescript-eslint/no-unnecessary-qualifier': 'error',
    '@typescript-eslint/no-unnecessary-template-expression': 'error',
    '@typescript-eslint/no-unsafe-enum-comparison': 'error',
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'error',
    '@typescript-eslint/no-useless-empty-export': 'error',
    '@typescript-eslint/non-nullable-type-assertion-style': 'error',
    'no-throw-literal': 'off',
    '@typescript-eslint/only-throw-error': 'error',
    '@typescript-eslint/prefer-enum-initializers': 'error',
    '@typescript-eslint/prefer-find': 'error',
    '@typescript-eslint/prefer-includes': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/prefer-reduce-type-parameter': 'error',
    '@typescript-eslint/prefer-regexp-exec': 'error',
    '@typescript-eslint/promise-function-async': 'error',
    '@typescript-eslint/require-array-sort-compare': 'error',
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
    '@typescript-eslint/no-throw-literal': 'error',
    '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
  },
};
