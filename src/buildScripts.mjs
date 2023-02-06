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
 */
const buildScripts = async({
    destinationFolder = '.',
    sourceFolder = '.',
    environments = '> 1%, not dead',
    target = 'es2022',
    sourceFiles = [],
    watch = [],
    minify = false,
    showNotifications = false,
} = {}) => {

    const sourceFilesWithPath = resolveGlobs(sourceFiles, sourceFolder);
    mkdirSync(destinationFolder, { recursive: true });

    const swc = swcPlugin({
        minify,
        env: {
            targets: environments,
            mode: 'usage',
        },
        jsc: {
            target,
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
