// Use function name to see if it is preserved
// Also use .mjs as ending to see if it is correctly included
export default (nr) => {
    // Test Nullish Coalescing
    const functionName = 'myIncludeFunction';
    const a = Math.random();
    const b = (a < 0.5) ?? 2;
    return `${functionName}-${nr * b}`;
}
