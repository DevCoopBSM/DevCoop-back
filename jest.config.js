// jest.config.js
module.exports = {
  // ...
  moduleNameMapper: {
    "@models": "<rootDir>/models",
    "@query": "<rootDir>/utils/query",
    "@token": "<rootDir>/utils/token",
    "@inventory": "<rootDir>/utils/inventory",
    "@date": "<rootDir>/utils/date",
    // 다른 별칭도 같은 방식으로 추가
  },
  // ...
};