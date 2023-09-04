import test from 'ava';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import resolveGlobs from './resolveGlobs.mjs';

const basePath = dirname(fileURLToPath(new URL(import.meta.url)));

test('resolves globs', async (t) => {
    const files = resolveGlobs([
        join(basePath, '../test/src/js/main*'),
    ]);
    t.deepEqual(files, [
        join(basePath, '../test/src/js/main2.js'),
        join(basePath, '../test/src/js/main.js'),
    ]);
});

test('prepends basePath', async (t) => {
    const files = resolveGlobs(['../test/src/js/main*'], basePath);
    t.deepEqual(files, [
        join(basePath, '../test/src/js/main2.js'),
        join(basePath, '../test/src/js/main.js'),
    ]);
});
