import { join } from 'path';
import { globSync } from 'glob';

/**
 * Prefixes glob paths with a base and resolves them globs
 * @param {string[]} globPaths      Paths that may contain globs; will be prefixed with basePath
 * @param {string} basePath         Path that will be prepended to globPaths
 */
export default (globPaths, basePath) => (
    globPaths
        .map((file) => (basePath ? join(basePath, file) : file))
        .map((fileWithPath) => globSync(fileWithPath))
        .flat()
);
