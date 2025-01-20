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

function copyLaunchFile() {
    const sourceFilePath = path.join(process.cwd(), 'scripts/setup/assets/launch.json');
    const destinationFilePath = path.join(process.cwd(), '.vscode/launch.json');

    fs.copyFileSync(sourceFilePath, destinationFilePath);
    console.log('launch.json file copied successfully.');
}

function createSettingsFile() {
    const sourceFilePath = path.join(process.cwd(), 'scripts/setup/assets/settings.json');
    const destinationFilePath = path.join(process.cwd(), '.vscode/settings.json');

    fs.copyFileSync(sourceFilePath, destinationFilePath);
    console.log('settings.json file copied successfully.');
}

export function createVSCodeConfig() {
    createVSCodeFolder();
    copyLaunchFile();
    createSettingsFile();
}

