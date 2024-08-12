
import { Compiler, Platforms } from "./compiler.js";

const args = process.argv.slice(2);

// if (args.length === 0) {
//     console.log("Usage: npx bun compile <platform>");
//     console.log("Platforms: " + Object.keys(Platforms).join(", "));
//     process.exit(1);
// }

if (args[0] === "all") {
    for (const platform in Platforms) {
        new Compiler(platform as keyof typeof Platforms).build();
    }
} else {
    new Compiler(args[0] as keyof typeof Platforms).build();
}