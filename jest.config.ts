import type { Config } from 'jest';

const config: Config = {
    verbose: true,
    coverageThreshold: {
        global: {
            // lines: 80
        }
    },
    moduleFileExtensions: [
        "js",
        "json",
        "ts"
    ],
    rootDir: "src",
    testRegex: ".*\\.spec\\.ts$",
    transform: {
        "^.+\\.(t|j)s$": "ts-jest"
    },
    collectCoverageFrom: [
        "**/*.ts",
        "!**/index.ts",
        "!main.ts"
    ],
    coverageDirectory: "../coverage",
    coveragePathIgnorePatterns: [
        "/node_modules/",
        ".module.ts",
        ".schema.ts",
        ".constant.ts",
        ".interface.ts",
        ".config.ts",
        ".filter.ts",
        ".interceptor.ts",
        ".controller.ts",
        ".dto.ts"
    ],
    moduleNameMapper: {
        "src/(.*)": [
            "<rootDir>/$1"
        ]
    },
    testEnvironment: "node"
};

export default config;