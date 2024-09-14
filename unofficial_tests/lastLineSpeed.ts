import * as fs from 'fs';
import * as readline from 'readline';
import { performance } from 'perf_hooks';

// Function to read the last n lines
async function readLastNLines(filePath: string, n: number): Promise<string> {
    const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const lines: string[] = [];
    for await (const line of rl) {
        lines.push(line);
        if (lines.length > n) {
            lines.shift(); // Remove the oldest line when we exceed `n` lines
        }
    }

    return lines.join('\n');
}

// Function to create a large file with garbage data
function createLargeFile(filePath: string, lines: number): void {
    const writeStream = fs.createWriteStream(filePath, { encoding: 'utf-8' });

    for (let i = 0; i < lines; i++) {
        writeStream.write(`Line ${i + 1}: ${Math.random().toString(36).substring(2)}\n`);
    }

    writeStream.end();
}

// Test function to measure performance
async function testReadLastNLines() {
    const filePath = './localtests/large_test_file.txt';
    const totalLines = 100_000;
    const lastNLines = 10;

    // Step 1: Create the large file
    console.log(`Creating a file with ${totalLines} lines...`);
    createLargeFile(filePath, totalLines);

    // Step 2: Measure the time taken to read the last n lines
    console.log(`Reading the last ${lastNLines} lines from the file...`);
    const startTime = performance.now();

    const lastLines = await readLastNLines(filePath, lastNLines);

    const endTime = performance.now();
    const timeTaken = endTime - startTime;

    // Output the results
    console.log(`Last ${lastNLines} lines:\n${lastLines}`);
    console.log(`Time taken to read last ${lastNLines} lines: ${timeTaken.toFixed(2)} ms`);

    // Cleanup
    fs.unlinkSync(filePath); // Delete the file after the test
}

// Run the test
testReadLastNLines().catch(console.error);
