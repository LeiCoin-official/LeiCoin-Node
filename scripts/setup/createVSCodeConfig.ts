import fs from 'fs';
import path from 'path';

function createVSCodeFolder() {
    const vscodeFolderPath = path.join(process.cwd(), '.vscode');
    if (!fs.existsSync(vscodeFolderPath)) {
        fs.mkdirSync(vscodeFolderPath);
        console.log('.vscode folder created successfully.');
    } else {
        console.log('.vscode folder already exists.');
    }
}

function copyLaunchJsonFile() {
    const sourceFilePath = path.join(process.cwd(), 'scripts/setup/assets/launch.json');
    const destinationFilePath = path.join(process.cwd(), '.vscode/launch.json');

    fs.copyFileSync(sourceFilePath, destinationFilePath);
    console.log('launch.json file copied successfully.');
}

export default function () {
    createVSCodeFolder();
    copyLaunchJsonFile();
}

