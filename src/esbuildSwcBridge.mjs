// Inspired by https://www.npmjs.com/package/esbuild-plugin-swc. Not using the original plugin
// because
// - source code (TypeScript) is not open sourced
// - does not handle node Paths (not starting with ./) correctly

import { resolve as resolvePath } from 'path';
import resolveNodeModule from 'resolve';
import { readFile } from 'fs';
import { transform } from '@swc/core';
import deepmerge from 'deepmerge';

const fileFilter = /\.m?js$/;

export default (options = {}) => ({
    name: 'esbuild-swc-bridge',
    setup(build) {
        build.onResolve({ filter: fileFilter }, async(args) => {
            // Resolve node_modules
            const fullPath = args.path.startsWith('.')
                ? resolvePath(args.resolveDir, args.path)
                : await new Promise((resolve, reject) => {
                    resolveNodeModule(args.path, (err, data) => {
                        if (err) reject(err);
                        else resolve(data);
                    });
                });
            return {
                path: fullPath,
            };
        });
        build.onLoad({ filter: fileFilter }, async(args) => {
            const code = await new Promise((resolve, reject) => {
                readFile(args.path, 'utf-8', (err, data) => {
                    if (err) reject(err);
                    else (resolve(data));
                });
            });
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
