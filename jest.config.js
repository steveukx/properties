module.exports = {
   "roots": [
      "<rootDir>/test/"
   ],
   "moduleFileExtensions": [
      "ts",
      "js",
      "json"
   ],
   "transform": {
      "^.+\\.[tj]s$": [
         "@swc/jest",
         {
            "jsc": {
               "target": "es2019",
               "parser": {
                  "syntax": "typescript"
               }
            },
            "module": {
               "type": "commonjs"
            }
         }
      ]
   },
   "coverageThreshold": {
      "global": {
         "branches": 80,
         "functions": 80,
         "lines": 80,
         "statements": 80
      }
   },
   "coveragePathIgnorePatterns": [
      "<rootDir>/test/"
   ],
   "coverageReporters": [
      "json",
      "lcov",
      "text",
      "clover"
   ],
   "testMatch": [
      "**/test/**/*.spec.*"
   ],
   "moduleNameMapper": {
      "^(.*/__fixtues__/.*)\\.ts$": "$1",
      "^properties-reader$": "<rootDir>/"
   }
};
