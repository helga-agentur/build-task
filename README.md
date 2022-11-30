# Intro

Build task for Joinbox' Drupal projects that provides command line actions running with reasonable
defaults for JavaScripts and SASS.

Tasks include multiple options, the ability to emit notifications on success and source maps.

# Commands


## Styles

- Converts [SASS to CSS](https://github.com/sass/dart-sass)
- Adds [autoprefixes](https://github.com/postcss/autoprefixer) through [postcss](https://postcss.org/)
- Accepts [globs](https://www.npmjs.com/package/glob) for input files
- Supports [compression](https://sass-lang.com/documentation/cli/dart-sass#style)
- Generates source maps
- Creates output directory if it doesn't exist
- Displays notification on success

### Command

`npx @joinbox/build-task styles -n -c -s src/scss -d dist/css **/*.scss`

### Options
`npx @joinbox/build-task styles -h`


## Scripts

- [Bundles JavaScript files](https://esbuild.github.io/)
- [Compiles code to previous ES versions](https://swc.rs/)
- Can [watch source files for changes](https://esbuild.github.io/api/#watch)
- Accepts [globs](https://www.npmjs.com/package/glob) for input files
- Builds for selected [browsers](https://github.com/browserslist/browserslist) and ES versions ([esbuild](https://esbuild.github.io/api/#target) and [SWC](https://swc.rs/docs/configuration/compilation#jsctarget))
- Supports minification ([esbuild](https://esbuild.github.io/api/#minify) and [SWC](https://swc.rs/docs/configuration/minification))
- Generates source maps
- Embedds [core-js](https://github.com/zloirock/core-js) polyfills where needed
- Creates output directory if it doesn't exist
- Displays notification on success

### Command

`npx @joinbox/build-task scripts -m -t es5 -e "ie 11" -s src/js -d dist/js **/*.js`

### Options
`npx @joinbox/build-task scripts -h`



# Defaults

1. Install all required modules
    `npm i @joinbox/build-task browser-sync chokidar npm-run-all`
2. Add the following property to your `package.json`:
    ```
    scripts: {
        "dev:styles":        "npx @joinbox/build-task styles -n -s src/scss -d dist/css main.scss",
        "live:styles":       "npx @joinbox/build-task styles -c -s src/scss -d dist/css main.scss",
        "watch:styles":      "npx chokidar \"src/scss/**/*.scss\" -c \"npm run styles",
        "dev:scripts":       "npx @joinbox/build-task scripts -n -s src/js -d dist/js main.js",
        "live:scripts":      "npx @joinbox/build-task scripts -m -s src/js -d dist/js main.js",
        "watch:scripts":     "npx chokidar \"src/js/**/*.js\" -c \"npm run dev:scripts",
        "watch:browsersync": "npx chokidar \"test/dist/**/**.*\" -c \"browsersync reload\"",
        "browsersync":       "npx browsersync start",
        "dev":               "npm run browsersync && npm-run-all --parallel dev:* && npm-run-all --parallel watch:*"
    }
    ```
