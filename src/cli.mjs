#!/usr/bin/env node

import { Command } from 'commander';
import buildStyles from './buildStyles.mjs';
import buildScripts from './buildScripts.mjs';

const program = new Command();

// To pass multiple paths/globs for the watch option, we must split them from the CLI's text into
// more normalized data; use a comma as separator
const convertCommaSeparatedListToArray = (arg) => arg.split(/,\s*/);

program
    .name('build')
    .description('Builds styles and scripts according to Joinbox\' default configuration');

program
    .command('styles')
    // Quotation marks around argument are needed for globs to be resolved through JS (and
    // therefore platform-independent)
    .argument('<source-files...>', 'files to process, divided by space; can contain globs, but they **must** be wrapped in quotation marks')
    .option('-c, --compress', 'compress the output (see SASS docs); defaults to false')
    .option('-s, --source-folder <path>', 'path to source folder; all source files must be placed relatively to this path; defaults to \'.\'')
    .option('-d, --destination-folder <path>', 'path to destination folder; all output files will be placed within this folder; defaults to \'.\'')
    .option('-w, --watch <paths>', 'watch files that match paths and rerun build task on changes; you may use globs, put them in quotation marks; split multiple paths by a comma', convertCommaSeparatedListToArray)
    .option('-n, --notifications', 'show notifications on successful completion; defaults to false')
    .action((sourceFiles, options) => {
        const parameters = {
            ...options,
            sourceFiles,
            showNotifications: options.notifications,
        };
        buildStyles(parameters);
    });

program
    .command('scripts')
    // Quotation marks around argument are needed for globs to be resolved through JS
    // (and therefore platform-independent)
    .argument('<source-files...>', 'files to process, divided by space; can contain globs, but they **must** be wrapped in quotation marks')
    .option('-m, --minify', 'minify the output; defaults to false')
    .option('-s, --source-folder <path>', 'path to source folder; all source files must be placed relatively to this path; defaults to \'.\'')
    .option('-d, --destination-folder <path>', 'path to destination folder; all output files will be placed within this folder; defaults to \'.\'')
    .option('-e, --environments <string>', 'browserlist compatible string of browsers/environments to support; defaults to \'> 1%, not dead\'')
    .option('-t, --target <string>', 'target ES version for SWC and esbuild, see https://esbuild.github.io/content-types/#real-esm-imports; value must be compatible with both esbuild and SWC; defaults to \'es2022\'')
    .option('-w, --watch <paths>', 'watch files that match paths and rerun build task on changes; you may use globs, put them in quotation marks; split multiple paths by a comma', convertCommaSeparatedListToArray)
    .option('-n, --notifications', 'show notifications on successful completion; defaults to false')
    .option('-r, --rename <string>', 'rename output files, e.g. [src]/[name]-[hash]-out, see esbuild\'s entryNames option')
    .action((sourceFiles, options) => {
        const parameters = {
            ...options,
            sourceFiles,
            showNotifications: options.notifications,
            destinationName: options.rename,
        };
        buildScripts(parameters);
    });


program.parse(process.argv);

