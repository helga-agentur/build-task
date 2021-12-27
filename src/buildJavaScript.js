const { babel } = require('@rollup/plugin-babel');
const { src, dest } = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const rollup = require('gulp-better-rollup');
const { terser } = require('rollup-plugin-terser');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const notifier = require('node-notifier');
const gulpSize = require('gulp-size');
const plumber = require('gulp-plumber');
const eslint = require('@rollup/plugin-eslint');
const eslintRules = require('@joinbox/eslint-config-joinbox');


const build = ({
    sourcePath,
    destinationPath,
    minify = false,
    supportedBrowsers = [],
} = {}) => {

    const size = gulpSize({
        showFiles: true,
        pretty: true,
    });

    // Return promise (instead of gulp stream) to be able to test file externally with ava,
    // see https://stackoverflow.com/questions/34188287/how-to-use-async-await-with-gulp-4
    return new Promise((resolve, reject) => {

        src(sourcePath)
            .pipe(plumber({
                errorHandler: (err) => {
                    notifier.notify({
                        title: '🤬 Scripts failed',
                        message: err.message,
                    });
                    console.error(err);
                },
            }))
            .pipe(sourcemaps.init())
            .pipe(rollup({
                plugins: [
                    // Only lint our internal code (before babeling it or resolving node modules)
                    // Options are defined in
                    // https://eslint.org/docs/developer-guide/nodejs-api#cliengine, even though
                    // CLIEngine seems to have been deprecated. Do use those keys (not the ones
                    // from the ESLint constructor) – or you will suffer
                    // We cannot resolve the .eslintrc of Joinbox via path,
                    // therefore we have to import it.
                    eslint({
                        // Use babel-eslint to lint JS as it supports ESNext
                        parser: 'babel-eslint',
                        ...eslintRules,
                        // Place useEslintrc at the end to overwrite contradicting properties
                        useEslintrc: false,
                    }),
                    // Rollup does not resolve node_modules by itself – it needs a plugin
                    nodeResolve({
                        browser: true,
                        // If we install e.g. the events NPM module and use it in a package (e.g
                        // Joinimation), rollup should use the *local* version, not a global one
                        // (as events does not exist in the browser environment)
                        preferBuiltins: false,
                    }),
                    // Some node modules use CJS (instead of native ES6 modules) – we must teach
                    // rollup how to resolve them. Must be placed before babel(), see
                    // https://www.npmjs.com/package/@rollup/plugin-babel
                    commonjs(),
                    babel({
                        babelHelpers: 'bundled',
                        plugins: [
                            // Use decorators for legacy reasons (MobX, e.g. on Careerplus)
                            ['@babel/plugin-proposal-decorators', { legacy: true }],
                            '@babel/plugin-proposal-class-properties',
                            '@babel/plugin-proposal-private-methods',
                        ],
                        // https://github.com/rollup/rollup-plugin-babel/issues/254
                        // Make sure **not** to exclude node_modules as they might contain newer
                        // code than the one required by supportedBrowsers
                        exclude: [/\/core-js\//],
                        presets: [
                            ['@babel/preset-env', {
                                useBuiltIns: 'usage',
                                targets: supportedBrowsers,
                                corejs: 3,
                            }],
                        ],
                    }),
                    // If environment is not develop, minify JavaScript. Don't do so on dev
                    // environment to improve speed
                    ...(minify ? [terser()] : []),
                ],
            }, {
                format: 'iife',
            }))
            .pipe(size)
            .pipe(sourcemaps.write('./'))
            .pipe(dest(destinationPath))
            .on('end', () => {
                resolve();
                notifier.notify({
                    title: '😅 Scripts done',
                    message: `Total size: ${size.prettySize}`,
                });
            })
            .on('error', reject);

    });
};

module.exports = build;
