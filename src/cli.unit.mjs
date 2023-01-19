import test from 'ava';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { deleteAsync } from 'del';
import { fileURLToPath } from 'url';

const asyncExec = promisify(exec);
const basePath = dirname(fileURLToPath(new URL(import.meta.url)));
const clear = () => deleteAsync(join(basePath, '../test/dist'));

test('exposes and executes style command', async(t) => {
    const { stdout, stderr } = await asyncExec(
        'node src/cli.mjs styles -c -s test/src/sass -d test/dist/css "**/*.scss"',
    );
    t.is(stdout, '');
    t.is(stderr, '');
    const files = readdirSync('test/dist/css');
    t.is(files.length, 4);
    await clear();
});

test('exposes and executes scripts command', async(t) => {
    const { stdout, stderr } = await asyncExec(
        'node src/cli.mjs scripts -m -s test/src/js -d test/dist/js -t es5 -e "ie 11" "**/*.js"',
    );
    t.is(stdout, '');
    t.is(stderr, '');
    const files = readdirSync('test/dist/js');
    t.is(files.length, 6);
    await clear();
});
