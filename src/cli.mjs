#!/usr/bin/env node

import { Command } from 'commander';
import buildStyles from './buildStyles.mjs';
import buildScripts from './buildScripts.mjs';

const program = new Command();

program
    .name('build')
    .description('Builds styles and scripts according to Joinbox\' default configuration');

program
    .command('styles')
    // Quotation marks around argument are needed for globs to be resolved through JS (and therefore platform-independent)
    .argument('<source-files...>', 'files to process, divided by space; can contain globs, but they **must** be wrapped in quotation marks')
    .option('-c, --compress', 'compress the output (see SASS docs); defaults to false')
    .option('-s, --source-folder <path>', 'path to source folder; all source files must be placed relatively to this path; defaults to \'.\'')
    .option('-d, --destination-folder <path>', 'path to destination folder; all output files will be placed within this folder; defaults to \'.\'')
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
    // Quotation marks around argument are needed for globs to be resolved through JS (and therefore platform-independent)
    .argument('<source-files...>', 'files to process, divided by space; can contain globs, but they **must** be wrapped in quotation marks')
    .option('-m, --minify', 'minify the output; defaults to false')
    .option('-s, --source-folder <path>', 'path to source folder; all source files must be placed relatively to this path; defaults to \'.\'')
    .option('-d, --destination-folder <path>', 'path to destination folder; all output files will be placed within this folder; defaults to \'.\'')
    .option('-e, --environments <string>', 'browserlist compatible string of browsers/environments to support; defaults to \'> 1%, not dead\'')
    .option('-t, --target <string>', 'target ES version for SWC and esbuild, see https://esbuild.github.io/content-types/#real-esm-imports; value must be compatible with both esbuild and SWC; defaults to \'es2022\'')
    .option('-w, --watch', 'watch source files for changes and rerun workflow if detected')
    .option('-n, --notifications', 'show notifications on successful completion; defaults to false')
    .action((sourceFiles, options) => {
        const parameters = { 
            ...options,
            sourceFiles,
            showNotifications: options.notifications,
        };
        buildScripts(parameters);
    });


program.parse(process.argv);

