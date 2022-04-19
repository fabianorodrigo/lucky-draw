/*
	1.	IMPORT LIBRARY ( MODULES )
	2.	GET ABI AND BYTECODE FROM COMPILE FILE
	3.	CREATE INSTANCE OF WEB3
	4.	TESTING WITH MOCHA
*/

/*==========================================
	1.	IMPORT LIBRARY ( MODULES )
==========================================*/
const assert = require("assert");
const ganache = require("ganache-cli");
/*
	Web3 is capitalize with W
	as calling the modules ( or the web3 constructor function ) 
*/
const Web3 = require("web3");

/*==========================================
	2.	GET ABI AND BYTECODE FROM COMPILE FILE
		FROM metadata and evm properties
==========================================*/
var {abi, evm} = require("../utils/compile.js");
const bytecode = evm.bytecode.object;
const abi_string = JSON.stringify(abi); // convert object to string

/*==========================================
	3.	CREATE INSTANCE OF WEB3
		to connect to this local test network ( ganache ) on local machine
==========================================*/
const web3 = new Web3(ganache.provider());

/*==========================================
	4.	TESTING WITH MOCHA
==========================================*/

beforeEach(async function () {
  accounts = await web3.eth.getAccounts();

  // console.log(accounts);

  LuckyDrawInstance = await new web3.eth.Contract(JSON.parse(abi_string))
    .deploy({data: bytecode})
    .send({from: accounts[0], gas: "1000000"});
});

describe("LuckyDraw", async function () {
  /*
		1.	TEST CONTRACT DEPLOYMENT 
	*/
  it("deploys a contract", async function () {
    assert.ok(LuckyDrawInstance.options.address);
  });

  it("test one participant to enter lucky draw games", async function () {
    await LuckyDrawInstance.methods.enterLuckyDraw().send({
      from: accounts[1],
      value: web3.utils.toWei("0.5", "ether"),
      gas: "1000000",
    });

    const total_participants = await LuckyDrawInstance.methods
      .total_participants()
      .call({
        from: accounts[0],
      });
    assert.equal(total_participants, 1);

    const participants = await LuckyDrawInstance.methods.participants(0).call({
      from: accounts[0],
    });
    assert.equal(participants.amount, 500000000000000000);

    const contractBalance = await LuckyDrawInstance.methods
      .contractBalance()
      .call({
        from: accounts[0],
      });
    assert.equal(contractBalance, 500000000000000000);

    // console.log(participants);
  });

  it("test more participants to enter lucky draw games", async function () {
    await LuckyDrawInstance.methods.enterLuckyDraw().send({
      from: accounts[1],
      value: web3.utils.toWei("0.5", "ether"),
      gas: "1000000",
    });

    await LuckyDrawInstance.methods.enterLuckyDraw().send({
      from: accounts[2],
      value: web3.utils.toWei("1", "ether"),
      gas: "1000000",
    });

    await LuckyDrawInstance.methods.enterLuckyDraw().send({
      from: accounts[3],
      value: web3.utils.toWei("5", "ether"),
      gas: "1000000",
    });

    await LuckyDrawInstance.methods.enterLuckyDraw().send({
      from: accounts[4],
      value: web3.utils.toWei("10", "ether"),
      gas: "1000000",
    });

    const total_participants = await LuckyDrawInstance.methods
      .total_participants()
      .call({
        from: accounts[0],
      });
    assert.equal(total_participants, 4);

    const contractBalance = await LuckyDrawInstance.methods
      .contractBalance()
      .call({
        from: accounts[0],
      });
    assert.equal(contractBalance, 16500000000000000000);
  });

  it("Require 0.5 ether to enter lucky draw games", async function () {
    try {
      await LuckyDrawInstance.methods.enterLuckyDraw().send({
        from: accounts[1],
        value: 0, // 0 ether,
        gas: "1000000",
      });
      assert(false); // this code will not be executed
    } catch (err) {
      assert(err); // if this code run , then test will pass
    }
  });

  it("Only Manager can find a Winner", async function () {
    try {
      /*
				this code will trigger error, because the manager that deploy the contraxt using accounts[0]
				if error , then it will be catch 
			*/
      await LuckyDrawInstance.methods.findWinner().send({
        from: accounts[1],
        gas: "1000000",
      });

      assert(false); // this code will not be executed because above code will trigger error, if not then this code will trigger, and test will false
    } catch (err) {
      assert(err); // if this code run , then test will pass
    }
  });

  it("find a Winner allowed if only has one participant", async function () {
    try {
      /*
				this code will trigger error, because the manager that deploy the contraxt using accounts[0]
				if error , then it will be catch 
			*/
      await LuckyDrawInstance.methods.findWinner().send({
        from: accounts[0],
        gas: "1000000",
      });

      assert(false); // this code will not be executed because above code will trigger error, if not then this code will trigger, and test will false
    } catch (err) {
      assert(err); // if this code run , then test will pass
    }
  });

  it("find a Winner", async function () {
    const balance_of_participant_1 = await web3.eth.getBalance(accounts[1]);
    const balance_of_participant_2 = await web3.eth.getBalance(accounts[2]);

    await LuckyDrawInstance.methods.enterLuckyDraw().send({
      from: accounts[1],
      value: web3.utils.toWei("1", "ether"),
      gas: "1000000",
    });

    await LuckyDrawInstance.methods.enterLuckyDraw().send({
      from: accounts[2],
      value: web3.utils.toWei("2", "ether"),
      gas: "1000000",
    });

    const participant_1 = await LuckyDrawInstance.methods.participants(0).call({
      from: accounts[0],
    });

    const participant_2 = await LuckyDrawInstance.methods.participants(1).call({
      from: accounts[0],
    });

    await LuckyDrawInstance.methods.findWinner().send({
      from: accounts[0],
      gas: "1000000",
    });

    const winner = await LuckyDrawInstance.methods.winner().call({
      from: accounts[0],
    });

    if (winner == participant_1.participant_address) {
      const new_balance_of_participant_1 = await web3.eth.getBalance(
        accounts[1]
      );

      assert(
        parseInt(balance_of_participant_1) <
          parseInt(new_balance_of_participant_1)
      );
    } else if (winner == participant_2.participant_address) {
      const new_balance_of_participant_2 = await web3.eth.getBalance(
        accounts[2]
      );

      assert(
        parseInt(balance_of_participant_2) <
          parseInt(new_balance_of_participant_2)
      );
    }

    const contractBalance = await LuckyDrawInstance.methods
      .contractBalance()
      .call({
        from: accounts[0],
      });
    assert.equal(contractBalance, 0);

    const totalParticipants = await LuckyDrawInstance.methods
      .total_participants()
      .call({
        from: accounts[0],
      });
    assert.equal(totalParticipants, 0);
  });

  it("Destroy Contract", async function () {
    const manager_account = await web3.eth.getBalance(accounts[0]);

    await LuckyDrawInstance.methods.enterLuckyDraw().send({
      from: accounts[1],
      value: web3.utils.toWei("2", "ether"),
      gas: "1000000",
    });

    await LuckyDrawInstance.methods.destroyContract().send({
      from: accounts[0],
      gas: "1000000",
    });

    const new_balance_of_manager_account = await web3.eth.getBalance(
      accounts[0]
    );

    // console.log(new_balance_of_manager_account);

    assert(
      parseInt(manager_account) < parseInt(new_balance_of_manager_account)
    );
  });
});
