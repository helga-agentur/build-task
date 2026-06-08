export default {
    files: [
        'src/**/*.unit.mjs',
        'src/**/*.integration.mjs',
    ],
    watchMode: {
        ignoreChanges: [
            'test',
        ],
    },
};
