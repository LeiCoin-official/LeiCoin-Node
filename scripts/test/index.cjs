/** @type {import('jest').Config} */
module.exports = {
    rootDir: "../",
    transform: {'^.+\\.ts?$': 'ts-jest'},
    testEnvironment: 'node',
    testRegex: './tests/.*\\.(test|spec)?\\.(ts|tsx)$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    transform: {
        '\\.[jt]sx?$': [
            'ts-jest',
            {
                useESM: true,
                tsconfig: './tsconfig.json'
            },
        ],
    },
    moduleNameMapper: {
        'bn.js': 'bn.js',
        'hash.js': 'hash.js',
        '(.+)\\.js': '$1'
    },
    extensionsToTreatAsEsm: ['.ts'],
    setupFiles: ['./scripts/test/setupTestEnv.cjs'],
};