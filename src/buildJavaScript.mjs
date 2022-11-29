import { build } from 'esbuild';
import swcPlugin from './esbuildSwcBridge.mjs';

// const swcPlugin = () => {};

const start = Date.now();

const swc = swcPlugin({
    minify: true,
    env: {
        targets: {
            ie: 11,
        },
    },
    jsc: {
        target: 'es5',
        minify: {
            compress: {
                unused: true,
            },
            mangle: true,
        },
    },
});

export default ({
    entryPoints,
    outfile,
    minify = false,
} = {}) => (
    build({
        entryPoints,
        bundle: true,
        outfile,
        sourcemap: true,
        plugins: [swc],
        target: 'es5', // Add this to minify correctly for ES5; shows warnings though
        minify,
    })
        .catch(console.error)
        .finally(() => {
            const done = Date.now();
            console.log('took', `${done - start}ms`);
        })
);

