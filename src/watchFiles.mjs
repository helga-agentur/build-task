import chokidar from 'chokidar';

/**
 * Use chokidar as file watcher because
 * - esbuild's own watch option uses polling (https://esbuild.github.io/api/#watch) and
 * does not work with styles (reduce our dependencies)
 * - using chokidar from the cli restarts the whole node process on every change which uses
 * Ignore initial add event as it is fired once for every single file that matches the
 * (glob) path
 */
export default (filesToWatch, callback) => {
    chokidar.watch(filesToWatch, { ignoreInitial: true }).on('all', callback);
};
