import type { Config } from 'jest';
import dotenv from 'dotenv'

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['./src/tests'],
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    testMatch: ['**/*.test.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@config(.*)$': '<rootDir>/src/config$1',
        '^@database(.*)$': '<rootDir>/src/database$1',
        '^@utils/(.*)$': '<rootDir>/src/utils/$1',
        '^@exceptions/(.*)$': '<rootDir>/src/utils/exceptions/$1',
        '^@helpers/(.*)$': '<rootDir>/src/utils/helpers/$1',
        '^@middlewares/(.*)$': '<rootDir>/src/middlewares/$1',
        '^@Auth/(.*)$': '<rootDir>/src/Modules/Auth/$1',
        '^@userManagement/(.*)$': '<rootDir>/src/Modules/userManagement/$1',
        '^@Attachment/(.*)$': '<rootDir>/src/Modules/Attachment/$1',
        '^@DocumentsRequest/(.*)$': '<rootDir>/src/Modules/DocumentsRequest/$1',
        '^@LabourAssignment/(.*)$': '<rootDir>/src/Modules/LabourAssignment/$1',
        '^@Labourer/(.*)$': '<rootDir>/src/Modules/Labourer/$1',
        '^@Permission/(.*)$': '<rootDir>/src/Modules/Permission/$1',
        '^@Project/(.*)$': '<rootDir>/src/Modules/Project/$1',
        '^@Role/(.*)$': '<rootDir>/src/Modules/Role/$1',
        '^@Task/(.*)$': '<rootDir>/src/Modules/Task/$1'
    },

    setupFiles: ['<rootDir>/src/tests/jest.setup.ts'],
};

export default config;