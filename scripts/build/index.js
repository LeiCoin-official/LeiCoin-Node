
await Bun.build({
    entrypoints: ['./src/index.ts'],
    target: "bun",
    sourcemap: "external",
    format: 'esm',
    outdir: './build/bin/',
});
