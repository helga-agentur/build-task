import test from 'ava';
import { exec } from 'child_process';
import { promisify } from 'util';

const asyncExec = promisify(exec);

test('exposes style command', async(t) => {
    const result = await asyncExec(
        'node src/main.mjs styles -c -s test/src/sass -d test/dist/css **/*.scss',
    );
    t.is(result.stdout, '');
});

test('exposes scripts command', async(t) => {
    const result = await asyncExec(
        'node src/main.mjs scripts -m -s test/src/sass -d test/dist/css -t es5 -e "ie 11" **/*.js',
    );
    t.is(result.stdout, '');
});
