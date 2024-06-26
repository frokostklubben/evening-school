/** @type { import("eslint").Linter.Config } */
module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		extraFileExtensions: ['.svelte']
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	overrides: [
		{
			files: ['*.svelte', '*.js'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser'
			}
		}
	]
};
/** @type { import("eslint").Linter.Config } */
module.exports = {
	// existing configuration...
	overrides: [
		// existing overrides...
		{
			files: ['*.js'],
			rules: {
				'off': true,
			}
		}
	]
};