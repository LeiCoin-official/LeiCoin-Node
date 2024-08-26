
await Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: './build/bundle/',
    target: "bun",
    //minify: true,
    sourcemap: "inline",
    format: 'esm',
    naming: "[dir]/leicoin-node.[ext]"
});

export {}