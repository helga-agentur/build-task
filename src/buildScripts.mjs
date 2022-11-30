import { join, relative } from 'path';
import { mkdirSync } from 'fs';
import notifier from 'node-notifier';
import glob from 'glob';
import { build } from 'esbuild';
import swcPlugin from './esbuildSwcBridge.mjs';

/**
 * Central handler to log results on initial and subsequent (watch) builds
 */
const logResult = ({ warnings, errors } = {}, showNotifications = false) => {
    if (warnings.length) console.warn(warnings);
    if (errors.length) console.error(errors);
    if (showNotifications) {
        notifier.notify({
            title: 'Scripts Done 💪',
            message: 'Built JS files',
        });
    }
};

const buildScripts = async({
    destinationFolder = '.',
    sourceFolder = '.',
    environments = '> 1%, not dead',
    target = 'es2022',
    sourceFiles = [],
    watch = false,
    minify = false,
    showNotifications = false,
} = {}) => {

    const sourceFilesWithPath = sourceFiles
        .map((file) => join(sourceFolder, file))
        .map((fileWithPath) => glob.sync(fileWithPath))
        .flat();

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

    const initialResult = await build({
        entryPoints: sourceFilesWithPath,
        bundle: true,
        sourcemap: true,
        outdir: destinationFolder,
        watch: watch ? {
            onRebuild(error, rebuildResult) {
                if (error) console.error(error);
                logResult(rebuildResult, showNotifications);
            },
        } : false,
        plugins: [swc],
        target, // Add this to minify correctly for ES5, if ES5 is passed
        minify,
    });
    logResult(initialResult, showNotifications);

};

export default buildScripts;
