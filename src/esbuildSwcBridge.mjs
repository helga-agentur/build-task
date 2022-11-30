// Inspired by https://www.npmjs.com/package/esbuild-plugin-swc. Not using the original plugin
// because
// - source code (TypeScript) was not open sourced at time of coding
// - does not handle node_module Paths (not starting with ./) correctly

import { resolve as resolvePath } from 'path';
import resolveNodeModule from 'resolve';
import { readFileSync } from 'fs';
import { promisify } from 'util';
import { transform } from '@swc/core';
import deepmerge from 'deepmerge';

const fileFilter = /\.m?js$/;
const promisifiedResolveNodeModule = promisify(resolveNodeModule);

/**
 * Use a simple script to build scripts because esbuild does not yet support the use of plugins
 * via console (see https://github.com/evanw/esbuild/issues/884)
 */
export default (options = {}) => ({
    name: 'esbuild-swc-bridge',
    setup(build) {
        build.onResolve({ filter: fileFilter }, async(args) => {
            // Resolve node_modules
            const fullPath = args.path.startsWith('.')
                ? resolvePath(args.resolveDir, args.path)
                : await promisifiedResolveNodeModule(args.path);
            return {
                path: fullPath,
            };
        });
        build.onLoad({ filter: fileFilter }, async(args) => {
            const code = readFileSync(args.path, 'utf-8');
            const initialOptions = {
                jsc: {
                    parser: {
                        syntax: 'ecmascript',
                    },
                },
                filename: args.path,
                sourceMaps: true,
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
