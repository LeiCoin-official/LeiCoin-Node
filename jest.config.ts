/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  projects: ["<rootDir>/tests/*"],
};

import type {Config} from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  projects: ['<rootDir>', '<rootDir>/tests/*'],
};

export default config;