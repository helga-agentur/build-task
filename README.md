# Intro

Build task for Joinbox' Drupal projects that provides command line actions running with reasonable
defaults for JavaScripts and SASS.

Tasks include multiple options, the ability to emit notifications on success and source maps.


# Installation

`npm i -D @joinbox/build-task core-js regenerator-runtime`

`core-js` and `regenerator-runtime` are required to inline the corresponding polyfills.

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

To see all available options, call the styles build task with the help option (`-h` or `--help`):

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

To see all available options, call the scripts build task with the help option (`-h` or `--help`):

`npx @joinbox/build-task scripts -h`



# Complete Build Task for Projects

Use the following setup for Drupal projects:

1. Install all additional modules:
    `npm i -D chokidar-cli npm-run-all @babel/eslint-parser @joinbox/eslint-config-joinbox eslint @joinbox/stylelint-config-joinbox stylelint`
2. Add the following `scripts` property to your `package.json`:
    ```
    "scripts": {
        "dev:styles": "npm run lint:styles ; npx @joinbox/build-task styles -n -s src/scss -d dist/css main.scss",
        "live:styles": "npx @joinbox/build-task styles -n -c -s src/scss -d dist/css main.scss",
        "watch:styles": "npx chokidar \"src/scss/**/*.scss\" \"template-library/**/*.scss\" -c \"npm run dev:styles\"",
        "dev:scripts": "npm run lint:scripts ; npx @joinbox/build-task scripts -n -s src/js -d dist/js main.js",
        "live:scripts": "npx @joinbox/build-task scripts -n -m -s src/js -d dist/js main.js",
        "watch:scripts": "npx chokidar \"src/js/**/*.js\" \"template-library/**/*.js\" -c \"npm run lint:scripts\" & npx @joinbox/build-task scripts -n -w -s src/js -d dist/js main.js",
        "copy:fonts": "mkdir -p dist/webfonts && cp -r src/webfonts dist/webfonts",
        "watch:fonts": "npx chokidar \"src/webfonts/**/*.*\" -c \"npm run copy:fonts\"",
        "copy:media": "mkdir -p dist/media && cp -r src/media dist/media",
        "watch:media": "npx chokidar \"src/media/**/*.*\" -c \"npm run copy:media\"",
        "clean": "(rm -r dist || true)",
        "lint:styles": "npx stylelint src/**/*.scss template-library/**/*.scss --config .stylelintrc",
        "lint:scripts": "npx eslint src/**/*.js template-library/**/*.js -c node_modules/@joinbox/eslint-config-joinbox/index.js",
        "dev": "npm-run-all clean -p copy:* dev:* -p watch:*",
        "live": "npm-run-all clean -p copy:* live:*"
    }
    ```

# Update from Earlier Versions

If you update from earlier versions, make sure to 
- remove all unnecessary NPM packages from package.json (especially `@babel/core`, `browser-sync`, `@babel/eslint-parser`, `gulp`, `postcss`)
- remove unnecessary `scripts` from package.json
- remove `gulpfile.js`
- update `@joinbox/build-task` to newest version and follow this README's instructions
