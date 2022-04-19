const path = require(`path`);
const fs = require(`fs`);
const solc = require(`solc`);

const contractPath = path.resolve(__dirname, `../contracts`, `LuckyDraw.sol`);

const source = fs.readFileSync(contractPath, `utf8`);
console.log(source);

const input = {
  language: "Solidity",
  sources: {
    "LuckyDraw.sol": {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["*"],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
console.log(output.contracts[`LuckyDraw.sol`]["LuckyDraw"]);

module.exports = output.contracts[`LuckyDraw.sol`]["LuckyDraw"];
