import test from 'ava';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { appendFileSync, readFileSync, writeFileSync } from 'fs';
import watchFiles from './watchFiles.mjs';

const basePath = dirname(fileURLToPath(new URL(import.meta.url)));

test('watches files', (t) => {
    let resolve;
    const fileToChange = join(basePath, '../test/src/js/main.js');
    const fileOriginalContent = readFileSync(fileToChange);
    const fileToWatch = join(basePath, '../test/src/js/**/*.js');
    // Make sure array of files can be passed
    watchFiles([fileToWatch], (event) => {
        // Ensure first event is not 'add'
        t.is(event, 'change');
        writeFileSync(fileToChange, fileOriginalContent);
        resolve();
    });
    appendFileSync(fileToChange, '\n');
    return new Promise((resolveFunction) => {
        resolve = resolveFunction;
    });
});
