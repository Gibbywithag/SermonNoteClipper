/* ESLint config for the Sermon Note Clipper dashboard.
   Classic (eslintrc) format to match the installed ESLint 8 toolchain. */
module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['react', 'react-refresh'],
  settings: { react: { version: 'detect' } },
  ignorePatterns: ['dist', 'node_modules'],
  rules: {
    // Capitalized names (React components / lucide icons) are exempt so an
    // imported-but-unused icon doesn't fail the build. jsx-uses-vars (from the
    // react plugin) makes <Icon/> JSX usage count as a use.
    'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
    'react/prop-types': 'off',
    'react/no-unescaped-entities': 'off',
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'no-empty': ['warn', { allowEmptyCatch: true }],
  },
};
