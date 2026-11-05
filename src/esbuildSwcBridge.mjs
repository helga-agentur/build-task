// Inspired by https://www.npmjs.com/package/esbuild-plugin-swc. Not using the original plugin
// because source code (TypeScript) was not open sourced at time of coding.

import { readFileSync } from 'fs';
import { transform } from '@swc/core';
import deepmerge from 'deepmerge';

const fileFilter = /\.m?js$/;

/**
 * Use a simple script to build scripts because esbuild does not yet support the use of plugins
 * via console (see https://github.com/evanw/esbuild/issues/884)
 *
 * Only hooks into onLoad; path resolution is intentionally left to esbuild.
 * @param {object} options      SWC options that will be merged with options from bridge
 */
export default (options = {}) => ({
    name: 'esbuild-swc-bridge',
    setup(build) {
        build.onLoad({ filter: fileFilter }, async (args) => {
            const code = readFileSync(args.path, 'utf-8');
            const initialOptions = {
                filename: args.path,
                sourceFileName: args.path,
            };
            const result = await (transform)(code, (0, deepmerge)(initialOptions, options));
            return {
                contents: result.code,
                loader: 'js',
            };
        });
    },
});
