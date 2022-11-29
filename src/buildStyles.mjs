import { join, basename, dirname } from 'path';
import { writeFile, mkdirSync } from 'fs';
import { promisify } from 'util';
import glob from 'glob';
import sass from 'sass';

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
} = {}) => {

    const files = sourceFiles
        .map((file) => join(sourceFolder, file))
        .map((fileWithPath) => glob.sync(fileWithPath))
        .flat();

    const promisifiedWriteFile = promisify(writeFile);
    await Promise.all(files.map((file) => {
        const sassOptions = { sourceMap: true, style: (compress ? 'compressed' : 'expanded') };
        const result = sass.compile(file, sassOptions);
        const cssFileName = basename(file).replace(/\.scss$/, '.css');
        const destinationFilePath = join(destinationFolder, cssFileName);
        // writeFile fails if directory does not exist; therefore create the directory
        // (recursive:true does only create inexisting folders)
        mkdirSync(dirname(destinationFilePath), { recursive: true });
        return Promise.all([
            promisifiedWriteFile(destinationFilePath, result.css),
            // A CSS map has a .map ending and contains the JSONified content of result.sourceMap
            // returned by sass.compile()
            promisifiedWriteFile(`${destinationFilePath}.map`, JSON.stringify(result.sourceMap)),
        ]);
    }));

};

export default buildStyles;
