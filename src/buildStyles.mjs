import { join, basename, dirname } from 'path';
import { writeFileSync, mkdirSync } from 'fs';
import autoprefixer from 'autoprefixer';
import postcss from 'postcss';
import notifier from 'node-notifier';
import sass from 'sass';
import resolveGlobs from './resolveGlobs.mjs';
import watchFiles from './watchFiles.mjs';


/**
 * Use a simple script to build styles as the CLI version of SASS does e.g.
 * - not support globs
 * - not support a central configuration of the output directory (instead the out path must be
 * specified for every file)
 * - not watch included files (chould be done through e.g. chokidar)
 */
const buildStyles = async({
    destinationFolder = '.',
    sourceFolder = '.',
    sourceFiles = [],
    compress = false,
    showNotifications = false,
} = {}) => {

    const files = resolveGlobs(sourceFiles, sourceFolder);

    // Process files
    const parsedCSSPromises = files.map(async(file) => {

        const cssFileName = basename(file).replace(/\.scss$/, '.css');
        const destinationFilePath = join(destinationFolder, cssFileName);

        const sassOptions = { sourceMap: true, style: (compress ? 'compressed' : 'expanded') };
        const sassResult = sass.compile(file, sassOptions);

        // prev: Pass a previous sourceMap object, see docs for SourceMapOptions at
        // https://postcss.org/api/; comment here
        // https://github.com/postcss/postcss/issues/222#issuecomment-318136962
        // If from or to are not provided, warning will be shown because sourceMaps cannot be
        // generated correctly (as they contain the css file's name)
        const postCSSOptions = {
            from: file,
            to: destinationFilePath,
            map: { prev: sassResult.sourceMap },
        };
        const postCSSResult = await postcss([autoprefixer]).process(sassResult.css, postCSSOptions);
        postCSSResult.warnings().forEach((warning) => console.warn(warning.toString()));

        return {
            css: postCSSResult.css,
            sourceMap: sassResult.sourceMap,
            destinationFilePath,
        };

    });
    const parsedCSSInfo = await Promise.all(parsedCSSPromises);


    // Write files to file system
    parsedCSSInfo.forEach((fileInfo) => {
        // writeFile fails if directory does not exist; therefore create the directory
        // (recursive:true does only create inexisting folders)
        mkdirSync(dirname(fileInfo.destinationFilePath), { recursive: true });
        writeFileSync(fileInfo.destinationFilePath, fileInfo.css);
        // A CSS map has a .map ending and contains the JSONified content of result.sourceMap
        // returned by sass.compile()
        writeFileSync(`${fileInfo.destinationFilePath}.map`, JSON.stringify(fileInfo.sourceMap));
    });

    const totalSize = parsedCSSInfo.reduce((sum, fileInfo) => sum + fileInfo.css.length, 0);
    const totalSizeInKB = Math.ceil(totalSize / 1000);
    const notificationOptions = ({
        title: 'Styles Done 💄',
        message: `Built ${files.length} CSS files (total size: ${totalSizeInKB}KB)`,
    });

    // Also log success message if notifications are not enabled
    console.log(`${notificationOptions.title}: ${notificationOptions.message}`);
    if (showNotifications) notifier.notify(notificationOptions);

};


const main = async({ watch = [], ...args } = {}) => {

    // Run initially
    await buildStyles(args);

    // If files to watch are provided, run on every change
    if (watch.length) {
        watchFiles(watch, () => buildStyles(args));
    }

};

export default main;
