const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const {abi, evm} = require("../utils/compile");
const bytecode = evm.bytecode.object;
const abi_string = JSON.stringify(abi);

//  METAMASK MNEUMONIC
const mneumonic = "muito estranho colocar seed phrase aqui";

//  DEFINE PROVIDER
const ropsten_network = `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY_LUCKY_DRAW}`;
const provider = new HDWalletProvider(mneumonic, ropsten_network);

// create instance of web3
const web3 = new Web3(provider);

async function deploy() {
  // Access list of Metamask accounts
  const accounts = await web3.eth.getAccounts();

  LuckyDrawInstance = await new web3.eth.Contract(JSON.parse(abi_string))
    .deploy({data: `0x${bytecode}`})
    .send({from: accounts[0], gas: "1000000"});

  console.log(`Contract deployed to: ${LuckyDrawInstance.options.address}`);
  console.log(`ABI: ${abi_string}`);
}

deploy();
