import test from 'ava';
import { deleteAsync } from 'del';
import { dirname, join } from 'path';
import { readdirSync, readFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import buildJavaScript from './buildJavaScript.mjs';

const basePath = dirname(fileURLToPath(new URL(import.meta.url)));
const destination = join(basePath, '../test/dist/js');
const source = join(basePath, '../test/src/js');
const clear = () => deleteAsync(join(basePath, '../test/dist'));

test('builds JavaScript files', async(t) => {
    await clear();
    mkdirSync(destination, { recursive: true });
    await buildJavaScript({
        entryPoints: [join(source, 'main.js')],
        outfile: join(destination, 'main.js'),
    });

    const files = readdirSync(destination);
    const content = readFileSync(join(destination, 'main.js'), 'utf8');
    // console.log(content);

    t.deepEqual(files, ['main.js', 'main.js.map']);
    // injected imported file
    t.is(content.includes('myIncludeFunction'), true);
    // private property was converted
    t.is(content.includes('#privateField'), false);
    // added polyfills
    // t.is(content.includes('core-js'), true);
    // only main.js was used as entry file
    t.is(content.includes('test2'), false);
    await clear();

});



/*
test('builds javascript file', async(t) => {
    await clear();
    await buildJavaScript({
        sourcePath: join(source, 'main.js'),
        destinationPath: destination,
    });
    const files = readdirSync(destination);
    const content = readFileSync(join(destination, 'main.js'), 'utf8');

    t.deepEqual(files, ['main.js', 'main.js.map']);
    // injected imported file
    t.is(content.includes('myIncludeFunction'), true);
    // private property was converted
    t.is(content.includes('#privateField'), false);
    // added polyfills
    t.is(content.includes('core-js'), true);
    // only main.js was used as entry file
    t.is(content.includes('test2'), false);
    await clear();
});

test('builds multiple javascript files', async(t) => {
    await clear();
    await buildJavaScript({
        sourcePath: [
            join(source, 'main.js'),
            join(source, 'main2.js'),
        ],
        destinationPath: destination,
    });
    const files = readdirSync(destination);
    t.deepEqual(files, ['main.js', 'main.js.map', 'main2.js', 'main2.js.map']);
    await clear();
});

test('minifies file', async(t) => {
    await clear();
    await buildJavaScript({
        sourcePath: join(source, 'main.js'),
        destinationPath: destination,
        minify: true,
    });
    const content = readFileSync(join(destination, 'main.js'), 'utf8');

    // Minification leads to less lines
    const lineCount = content.split(/\n/g).length;
    t.is(lineCount < 10, true);
    await clear();
});

test('converts nullish coaelscing', async(t) => {
    await clear();
    await buildJavaScript({
        sourcePath: join(source, 'main.js'),
        destinationPath: destination,
    });
    const content = readFileSync(join(destination, 'main.js'), 'utf8');
    t.is(content.includes('??'), false);
    await clear();
});


*/