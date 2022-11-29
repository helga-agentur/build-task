import { Command } from 'commander';
import buildStyles from './buildStyles.mjs';

const program = new Command();

program
    .name('build')
    .description('Builds styles and scripts according to Joinbox\' default configuration');

program
    .command('styles')
    .argument('<source-files...>', 'files to process')
    .option('-c, --compress', 'compress output')
    .option('-s, --source-folder <path>', 'source folder')
    .option('-d, --destination-folder <path>', 'destination folder')
    .action((sourceFiles, options) => {
        const parameters = { ...options, sourceFiles };
        console.log('params', parameters);
        buildStyles(parameters);
    });

program.parse(process.argv);

