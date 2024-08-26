
//import fs from 'fs';
//const { dependencies } = JSON.parse(fs.readFileSync("./package.json"));

await Bun.build({
    entrypoints: ['scripts/build/entrypoint.ts'],
    target: "bun",
    //external: Object.keys(dependencies),
    sourcemap: "inline",
    format: 'esm',
    //tsconfig: "tsconfig.json",
    outdir: 'build/bin/full',
    naming: "[dir]/leicoin-node.[ext]"
});

export {}
