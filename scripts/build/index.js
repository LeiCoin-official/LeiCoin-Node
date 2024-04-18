import { build } from 'esbuild';
//import fs from 'fs';
//const { dependencies } = JSON.parse(fs.readFileSync("./package.json"));

await build({
    entryPoints: ['src/index.ts'],
    platform: "node",
    target: ["node18"],
    packages: "external",
    //external: Object.keys(dependencies),
    bundle: true,
    sourcemap: true,
    minify: true,
    format: 'cjs',
    //tsconfig: "tsconfig.json",
    outfile: 'build/bin/leicoin-node.cjs'
});