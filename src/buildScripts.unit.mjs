import test from 'ava';
import { deleteAsync } from 'del';
import { dirname, join } from 'path';
import { readdirSync, readFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import buildScripts from './buildScripts.mjs';

const basePath = dirname(fileURLToPath(new URL(import.meta.url)));
const destination = join(basePath, '../test/dist/js');
const source = join(basePath, '../test/src/js');
const clear = () => deleteAsync(join(basePath, '../test/dist'));

test('builds JavaScript files', async(t) => {
    await clear();
    await buildScripts({
        sourceFiles: ['main.js'],
        sourceFolder: source,
        destinationFolder: destination,
        environments: 'ie 11',
        target: 'es5',
    });

    const files = readdirSync(destination);
    const content = readFileSync(join(destination, 'main.js'), 'utf8');

    t.deepEqual(files, ['main.js', 'main.js.map']);
    // injected imported file
    t.is(content.includes('myIncludeFunction'), true);
    // private property was converted
    t.is(content.includes('#privateField'), false);
    // added polyfills
    // t.is(content.includes('core-js'), true);
    // only main.js was used as entry file
    t.is(content.includes('test2'), false);
    // Converts nullish coalescing; '??' is part of a RegEx in core-js, therefore test with 
    // the following code/number (see include.js)
    t.is(/\?\?\s?2/.test(content), false);
    // Async will be found as it is part of the polyfills; make sure we use async with a space
    t.is(content.includes('async '), false);
    // See if core-js polyfills are added correctly
    t.is(content.includes('core-js'), true);
    // await clear();
});

test('works with globs', async(t) => {
    await clear();
    await buildScripts({
        sourceFiles: ['main.js', 'main2.js'],
        sourceFolder: source,
        destinationFolder: destination,
    });
    const files = readdirSync(destination);
    t.deepEqual(files, ['main.js', 'main.js.map', 'main2.js', 'main2.js.map']);
    await clear();
});

test('works with multiple files', async(t) => {
    await clear();
    await buildScripts({
        sourceFiles: ['main*.js'],
        sourceFolder: source,
        destinationFolder: destination,
    });
    const files = readdirSync(destination);
    t.deepEqual(files, ['main.js', 'main.js.map', 'main2.js', 'main2.js.map']);
    await clear();
});

test('minifies files', async(t) => {
    await clear();
    await buildScripts({
        sourceFiles: ['main.js'],
        sourceFolder: source,
        destinationFolder: destination,
        minify: true,
    });
    const content = readFileSync(join(destination, 'main.js'), 'utf8');
    // 3 lines of code: one for the code, the other for the source map; then an empty line
    t.is(content.split('\n').length, 3);
    await clear();
});
