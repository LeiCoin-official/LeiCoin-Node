
await Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: './build/bundle/',
    target: "bun",
    sourcemap: "linked",
    format: 'esm',
    naming: "[dir]/leicoin-node.[ext]"
});
