module.exports = {
	parser: "@typescript-eslint/parser",
	parserOptions: {
		project: "tsconfig.json",
		tsconfigRootDir: __dirname,
		sourceType: "module",
	},
	plugins: ["@typescript-eslint/eslint-plugin"],
	extends: ["plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"],
	root: true,
	env: {
		node: true,
		jest: true,
	},
	ignorePatterns: [".eslintrc.js"],
	rules: {
		"prettier/prettier": [
			"error",
			{
				useTabs: true,
				tabWidth: 4,
				semi: true,
				singleQuote: false,
				jsxSingleQuote: false,
				trailingComma: "all",
				bracketSpacing: true,
				bracketSameLine: false,
				arrowParens: "avoid",
				importOrder: ["^[./]"],
				importOrderSortSpecifiers: true,
				importOrderSeparation: true,
				printWidth: 120,
			},
		],
	},
};
