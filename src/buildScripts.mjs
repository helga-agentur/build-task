import { mkdirSync } from 'fs';
import notifier from 'node-notifier';
import * as esbuild from 'esbuild';
import swcPlugin from './esbuildSwcBridge.mjs';
import resolveGlobs from './resolveGlobs.mjs';
import watchFiles from './watchFiles.mjs';

/**
 * Central handler to log results on initial and subsequent (watch) builds
 */
const logResult = ({ warnings, errors } = {}, numberOfFiles = 0, showNotifications = false) => {
    // esbuildContext.rebuild's return value (result) contains an ouputFiles property which is
    // undefined; until this changes, we cannot really display more stats than the original
    // amout of entry files passed in.
    if (warnings.length) console.warn(warnings);
    if (errors.length) console.error(errors);
    const notificationOptions = {
        title: 'Scripts Done 🚀',
        message: `Built ${numberOfFiles} JS files`,
    };
    // Also log success message if notifications are not enabled
    console.log(`${notificationOptions.title}: ${notificationOptions.message}`);
    if (showNotifications) notifier.notify(notificationOptions);
};

/**
 * Use our own script (instead of relying only on console commands) because the console does not
 * support SWC bridges (needed to make it work with esbuild as SWC's build feature is not yet
 * stable).
 * Use our own glob solution as NPM handles globs differently on different operating systems
 * (see https://medium.com/@jakubsynowiec/you-should-always-quote-your-globs-in-npm-scripts-621887a2a784)
 * @param {string} destinationFolder        Folder to write output files to
 * @param {string} sourceFolder             Base folder from where sourceFiles will be looked up.
 *                                          The output of source files in subfolders relative to
 *                                          sourceFolder will be placed in the same subfolder
 *                                          structure relative to destinationFolder
 * @param {string} environments             See SWC's env.targets option
 * @param {string} target                   See SWC's jsc.target and esbuild's target options
 * @param {string[]} sourceFiles            Array of Globs to find all source files to process
 * @param {string[]} watch                  Array of globs of files to watch and rebuild output
 *                                          on change
 * @param {boolean} minify                  True if output files should be minified
 * @param {boolean} showNotifications       True if OS notifications should be displayed
 * @param {string} destinationName          See esbuild's entryNames option
 */
const buildScripts = async ({
    destinationFolder = '.',
    sourceFolder = '.',
    environments = '> 1%, not dead',
    target = 'es2022',
    sourceFiles = [],
    watch = [],
    minify = false,
    showNotifications = false,
    destinationName,
} = {}) => {
    const sourceFilesWithPath = resolveGlobs(sourceFiles, sourceFolder);
    mkdirSync(destinationFolder, { recursive: true });

    const swc = swcPlugin({
        minify,
        sourceMaps: true,
        env: {
            targets: environments,
            mode: 'usage',
        },
        jsc: {
            parser: {
                syntax: 'typescript',
                // Add support for Decorators for Careerplus
                decorators: true,
            },
        },
    });

    // Create context in order to reuse config later in rebuild() if a watcher is setup
    const esbuildContext = await esbuild.context({
        entryPoints: sourceFilesWithPath,
        bundle: true,
        sourcemap: true,
        outdir: destinationFolder,
        plugins: [swc],
        target, // Add this to minify correctly for ES5, if ES5 is passed
        minify,
        outbase: sourceFolder,
        ...(destinationName && { entryNames: destinationName }),
    });

    const result = await esbuildContext.rebuild();
    logResult(result, sourceFilesWithPath.length, showNotifications);

    if (!watch.length) {
        // If we don't explicitly dispose esbuild's context, the script will not finish; therefore
        // dispose it instantly if we're not watching any files
        esbuildContext.dispose();
    } else {
        watchFiles(watch, async () => {
            const rebuildResult = await esbuildContext.rebuild();
            logResult(rebuildResult, sourceFilesWithPath.length, showNotifications);
        });
    }
};

export default buildScripts;
