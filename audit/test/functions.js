// Jul 14 2017
var ethPriceUSD = 205.452;

// -----------------------------------------------------------------------------
// Accounts
// -----------------------------------------------------------------------------
var accounts = [];
var accountNames = {};

addAccount(eth.accounts[0], "Account #0 - Miner");
addAccount(eth.accounts[1], "Account #1 - Contract Owner");
addAccount(eth.accounts[2], "Account #2 - Multisig");
addAccount(eth.accounts[3], "Account #3");
addAccount(eth.accounts[4], "Account #4");
addAccount(eth.accounts[5], "Account #5");
addAccount(eth.accounts[6], "Account #6");
addAccount(eth.accounts[7], "Account #7");
addAccount(eth.accounts[8], "Account #8");
addAccount(eth.accounts[9], "Account #9");
addAccount(eth.accounts[10], "Account #10 - Collector");


var minerAccount = eth.accounts[0];
var contractOwnerAccount = eth.accounts[1];
var multisig = eth.accounts[2];
var account3 = eth.accounts[3];
var account4 = eth.accounts[4];
var account5 = eth.accounts[5];
var account6 = eth.accounts[6];
var account7 = eth.accounts[7];
var account8 = eth.accounts[8];
var account9 = eth.accounts[9];
var collector = eth.accounts[10];

var baseBlock = eth.blockNumber;

function unlockAccounts(password) {
  for (var i = 0; i < eth.accounts.length; i++) {
    personal.unlockAccount(eth.accounts[i], password, 100000);
  }
}

function addAccount(account, accountName) {
  accounts.push(account);
  accountNames[account] = accountName;
}


// -----------------------------------------------------------------------------
// Token Contract
// -----------------------------------------------------------------------------
var tokenContractAddress = null;
var tokenContractAbi = null;

function addTokenContractAddressAndAbi(address, tokenAbi) {
  tokenContractAddress = address;
  tokenContractAbi = tokenAbi;
}


// -----------------------------------------------------------------------------
// Account ETH and token balances
// -----------------------------------------------------------------------------
function printBalances() {
  var token = tokenContractAddress == null || tokenContractAbi == null ? null : web3.eth.contract(tokenContractAbi).at(tokenContractAddress);
  var decimals = token == null ? 18 : token.decimals();
  var i = 0;
  var totalTokenBalance = new BigNumber(0);
  console.log("RESULT:  # Account                                             EtherBalanceChange                          Token Name");
  console.log("RESULT: -- ------------------------------------------ --------------------------- ------------------------------ ---------------------------");
  accounts.forEach(function(e) {
    var etherBalanceBaseBlock = eth.getBalance(e, baseBlock);
    var etherBalance = web3.fromWei(eth.getBalance(e).minus(etherBalanceBaseBlock), "ether");
    var tokenBalance = token == null ? new BigNumber(0) : token.balanceOf(e).shift(-decimals);
    totalTokenBalance = totalTokenBalance.add(tokenBalance);
    console.log("RESULT: " + pad2(i) + " " + e  + " " + pad(etherBalance) + " " + padToken(tokenBalance, decimals) + " " + accountNames[e]);
    i++;
  });
  console.log("RESULT: -- ------------------------------------------ --------------------------- ------------------------------ ---------------------------");
  console.log("RESULT:                                                                           " + padToken(totalTokenBalance, decimals) + " Total Token Balances");
  console.log("RESULT: -- ------------------------------------------ --------------------------- ------------------------------ ---------------------------");
  console.log("RESULT: ");
}

function pad2(s) {
  var o = s.toFixed(0);
  while (o.length < 2) {
    o = " " + o;
  }
  return o;
}

function pad(s) {
  var o = s.toFixed(18);
  while (o.length < 27) {
    o = " " + o;
  }
  return o;
}

function padToken(s, decimals) {
  var o = s.toFixed(decimals);
  var l = parseInt(decimals)+12;
  while (o.length < l) {
    o = " " + o;
  }
  return o;
}


// -----------------------------------------------------------------------------
// Transaction status
// -----------------------------------------------------------------------------
function printTxData(name, txId) {
  var tx = eth.getTransaction(txId);
  var txReceipt = eth.getTransactionReceipt(txId);
  var gasPrice = tx.gasPrice;
  var gasCostETH = tx.gasPrice.mul(txReceipt.gasUsed).div(1e18);
  var gasCostUSD = gasCostETH.mul(ethPriceUSD);
  var block = eth.getBlock(txReceipt.blockNumber);
  console.log("RESULT: " + name + " status=" + txReceipt.status + (txReceipt.status == 0 ? " Failure" : " Success") + " gas=" + tx.gas +
    " gasUsed=" + txReceipt.gasUsed + " costETH=" + gasCostETH + " costUSD=" + gasCostUSD +
    " @ ETH/USD=" + ethPriceUSD + " gasPrice=" + web3.fromWei(gasPrice, "gwei") + " gwei block=" + 
    txReceipt.blockNumber + " txIx=" + tx.transactionIndex + " txId=" + txId +
    " @ " + block.timestamp + " " + new Date(block.timestamp * 1000).toUTCString());
}

function assertEtherBalance(account, expectedBalance) {
  var etherBalance = web3.fromWei(eth.getBalance(account), "ether");
  if (etherBalance == expectedBalance) {
    console.log("RESULT: OK " + account + " has expected balance " + expectedBalance);
  } else {
    console.log("RESULT: FAILURE " + account + " has balance " + etherBalance + " <> expected " + expectedBalance);
  }
}

function failIfTxStatusError(tx, msg) {
  var status = eth.getTransactionReceipt(tx).status;
  if (status == 0) {
    console.log("RESULT: FAIL " + msg);
    return 0;
  } else {
    console.log("RESULT: PASS " + msg);
    return 1;
  }
}

function passIfTxStatusError(tx, msg) {
  var status = eth.getTransactionReceipt(tx).status;
  if (status == 1) {
    console.log("RESULT: FAIL " + msg);
    return 0;
  } else {
    console.log("RESULT: PASS " + msg);
    return 1;
  }
}

function gasEqualsGasUsed(tx) {
  var gas = eth.getTransaction(tx).gas;
  var gasUsed = eth.getTransactionReceipt(tx).gasUsed;
  return (gas == gasUsed);
}

function failIfGasEqualsGasUsed(tx, msg) {
  var gas = eth.getTransaction(tx).gas;
  var gasUsed = eth.getTransactionReceipt(tx).gasUsed;
  if (gas == gasUsed) {
    console.log("RESULT: FAIL " + msg);
    return 0;
  } else {
    console.log("RESULT: PASS " + msg);
    return 1;
  }
}

function passIfGasEqualsGasUsed(tx, msg) {
  var gas = eth.getTransaction(tx).gas;
  var gasUsed = eth.getTransactionReceipt(tx).gasUsed;
  if (gas == gasUsed) {
    console.log("RESULT: PASS " + msg);
    return 1;
  } else {
    console.log("RESULT: FAIL " + msg);
    return 0;
  }
}

function failIfGasEqualsGasUsedOrContractAddressNull(contractAddress, tx, msg) {
  if (contractAddress == null) {
    console.log("RESULT: FAIL " + msg);
    return 0;
  } else {
    var gas = eth.getTransaction(tx).gas;
    var gasUsed = eth.getTransactionReceipt(tx).gasUsed;
    if (gas == gasUsed) {
      console.log("RESULT: FAIL " + msg);
      return 0;
    } else {
      console.log("RESULT: PASS " + msg);
      return 1;
    }
  }
}


//-----------------------------------------------------------------------------
// Wait until some unixTime + additional seconds
//-----------------------------------------------------------------------------
function waitUntil(message, unixTime, addSeconds) {
  var t = parseInt(unixTime) + parseInt(addSeconds) + parseInt(1);
  var time = new Date(t * 1000);
  console.log("RESULT: Waiting until '" + message + "' at " + unixTime + "+" + addSeconds + "s =" + time + " now=" + new Date());
  while ((new Date()).getTime() <= time.getTime()) {
  }
  console.log("RESULT: Waited until '" + message + "' at at " + unixTime + "+" + addSeconds + "s =" + time + " now=" + new Date());
  console.log("RESULT: ");
}


//-----------------------------------------------------------------------------
// Wait until some block
//-----------------------------------------------------------------------------
function waitUntilBlock(message, block, addBlocks) {
  var b = parseInt(block) + parseInt(addBlocks);
  console.log("RESULT: Waiting until '" + message + "' #" + block + "+" + addBlocks + " = #" + b + " currentBlock=" + eth.blockNumber);
  while (eth.blockNumber <= b) {
  }
  console.log("RESULT: Waited until '" + message + "' #" + block + "+" + addBlocks + " = #" + b + " currentBlock=" + eth.blockNumber);
  console.log("RESULT: ");
}


//-----------------------------------------------------------------------------
// Crowdsale Contract
//-----------------------------------------------------------------------------
var crowdsaleContractAddress = null;
var crowdsaleContractAbi = null;

function addCrowdsaleContractAddressAndAbi(address, abi) {
  crowdsaleContractAddress = address;
  crowdsaleContractAbi = abi;
}

var crowdsaleFromBlock = 0;
function printCrowdsaleContractDetails() {
  console.log("RESULT: crowdsaleContractAddress=" + crowdsaleContractAddress);
  // console.log("RESULT: crowdsaleContractAbi=" + JSON.stringify(crowdsaleContractAbi));
  if (crowdsaleContractAddress != null && crowdsaleContractAbi != null) {
    var contract = eth.contract(crowdsaleContractAbi).at(crowdsaleContractAddress);
    console.log("RESULT: crowdsale.controller=" + contract.controller());
    console.log("RESULT: crowdsale.aix=" + contract.aix());
    console.log("RESULT: crowdsale.transferable=" + contract.transferable());
    console.log("RESULT: crowdsale.contributionWallet=" + contract.contributionWallet());
    console.log("RESULT: crowdsale.remainderHolder=" + contract.remainderHolder());
    console.log("RESULT: crowdsale.devHolder=" + contract.devHolder());
    console.log("RESULT: crowdsale.communityHolder=" + contract.communityHolder());
    console.log("RESULT: crowdsale.exchanger=" + contract.exchanger());
    console.log("RESULT: crowdsale.collector=" + contract.collector());
    console.log("RESULT: crowdsale.collectorWeiCap=" + contract.collectorWeiCap() + " " + contract.collectorWeiCap().shift(-18));
    console.log("RESULT: crowdsale.collectorWeiCollected=" + contract.collectorWeiCollected() + " " + contract.collectorWeiCollected().shift(-18));
    console.log("RESULT: crowdsale.totalWeiCap=" + contract.totalWeiCap() + " " + contract.totalWeiCap().shift(-18));
    console.log("RESULT: crowdsale.totalWeiCollected=" + contract.totalWeiCollected() + " " + contract.totalWeiCollected().shift(-18));
    console.log("RESULT: crowdsale.weiPreCollected=" + contract.weiPreCollected() + " " + contract.weiPreCollected().shift(-18));
    console.log("RESULT: crowdsale.notCollectedAmountAfter24Hours=" + contract.notCollectedAmountAfter24Hours() + " " + contract.notCollectedAmountAfter24Hours().shift(-18));
    console.log("RESULT: crowdsale.twentyPercentWithBonus=" + contract.twentyPercentWithBonus());
    console.log("RESULT: crowdsale.thirtyPercentWithBonus=" + contract.thirtyPercentWithBonus());
    console.log("RESULT: crowdsale.minimumPerTransaction=" + contract.minimumPerTransaction() + " " + contract.minimumPerTransaction().shift(-18));
    console.log("RESULT: crowdsale.numWhitelistedInvestors=" + contract.numWhitelistedInvestors());
    console.log("RESULT: crowdsale.startTime=" + contract.startTime() + " " + new Date(contract.startTime() * 1000).toUTCString());
    console.log("RESULT: crowdsale.endTime=" + contract.endTime() + " " + new Date(contract.endTime() * 1000).toUTCString());
    console.log("RESULT: crowdsale.initializedTime=" + contract.initializedTime() + " " + new Date(contract.initializedTime() * 1000).toUTCString());
    console.log("RESULT: crowdsale.finalizedTime=" + contract.finalizedTime() + " " + new Date(contract.finalizedTime() * 1000).toUTCString());
    console.log("RESULT: crowdsale.initializedBlock=" + contract.initializedBlock());
    console.log("RESULT: crowdsale.finalizedBlock=" + contract.finalizedBlock());
    console.log("RESULT: crowdsale.paused=" + contract.paused());

    var latestBlock = eth.blockNumber;
    var i;

    var newSaleEvents = contract.NewSale({}, { fromBlock: crowdsaleFromBlock, toBlock: latestBlock });
    i = 0;
    newSaleEvents.watch(function (error, result) {
      console.log("RESULT: NewSale " + i++ + " #" + result.blockNumber + ": " + JSON.stringify(result.args));
    });
    newSaleEvents.stopWatching();

    var initializedEvents = contract.Initialized({}, { fromBlock: crowdsaleFromBlock, toBlock: latestBlock });
    i = 0;
    initializedEvents.watch(function (error, result) {
      console.log("RESULT: Initialized " + i++ + " #" + result.blockNumber + ": " + JSON.stringify(result.args));
    });
    initializedEvents.stopWatching();

    var finalizedEvents = contract.Finalized({}, { fromBlock: crowdsaleFromBlock, toBlock: latestBlock });
    i = 0;
    finalizedEvents.watch(function (error, result) {
      console.log("RESULT: Finalized " + i++ + " #" + result.blockNumber + ": " + JSON.stringify(result.args));
    });
    finalizedEvents.stopWatching();

    crowdsaleFromBlock = parseInt(latestBlock) + 1;
  }
}


//-----------------------------------------------------------------------------
// PlaceHolder Contract
//-----------------------------------------------------------------------------
var placeHolderContractAddress = null;
var placeHolderContractAbi = null;

function addPlaceHolderContractAddressAndAbi(address, abi) {
  placeHolderContractAddress = address;
  placeHolderContractAbi = abi;
}

var placeHolderFromBlock = 0;
function printPlaceHolderContractDetails() {
  console.log("RESULT: placeHolderContractAddress=" + placeHolderContractAddress);
  // console.log("RESULT: placeHolderContractAbi=" + JSON.stringify(placeHolderContractAbi));
  if (placeHolderContractAddress != null && placeHolderContractAbi != null) {
    var contract = eth.contract(placeHolderContractAbi).at(placeHolderContractAddress);
    console.log("RESULT: placeHolder.controller=" + contract.controller());
    console.log("RESULT: placeHolder.transferable=" + contract.transferable());
    var latestBlock = eth.blockNumber;
    var i;

    var claimedTokensEvents = contract.ClaimedTokens({}, { fromBlock: placeHolderFromBlock, toBlock: latestBlock });
    i = 0;
    claimedTokensEvents.watch(function (error, result) {
      console.log("RESULT: ClaimedTokens " + i++ + " #" + result.blockNumber + ": " + JSON.stringify(result.args));
    });
    claimedTokensEvents.stopWatching();

    placeHolderFromBlock = parseInt(latestBlock) + 1;
  }
}


//-----------------------------------------------------------------------------
// Token Contract
//-----------------------------------------------------------------------------
var tokenFromBlock = 0;
function printTokenContractDetails() {
  console.log("RESULT: tokenContractAddress=" + tokenContractAddress);
  // console.log("RESULT: tokenContractAbi=" + JSON.stringify(tokenContractAbi));
  if (tokenContractAddress != null && tokenContractAbi != null) {
    var contract = eth.contract(tokenContractAbi).at(tokenContractAddress);
    var decimals = contract.decimals();
    console.log("RESULT: token.controller=" + contract.controller());
    console.log("RESULT: token.symbol=" + contract.symbol());
    console.log("RESULT: token.name=" + contract.name());
    console.log("RESULT: token.decimals=" + decimals);
    console.log("RESULT: token.totalSupply=" + contract.totalSupply().shift(-decimals));
    console.log("RESULT: token.transfersEnabled=" + contract.transfersEnabled());
    // console.log("RESULT: token.totalSupplyHistory=" + contract.totalSupplyHistory());

    var latestBlock = eth.blockNumber;
    var i;

    /*
    var totalSupplyHistoryLength = contract.totalSupplyHistoryLength();
    for (i = 0; i < totalSupplyHistoryLength; i++) {
      var e = contract.totalSupplyHistory(i);
      console.log("RESULT: totalSupplyHistory(" + i + ") = " + e[0] + " => " + e[1].shift(-decimals));
    }

    var balanceHistoryLength = contract.balanceHistoryLength(account3);
    for (i = 0; i < balanceHistoryLength; i++) {
      var e = contract.balanceHistory(account3, i);
      console.log("RESULT: balanceHistory(" + account3 + ", " + i + ") = " + e[0] + " => " + e[1].shift(-decimals));
    }

    var balanceHistoryLength = contract.balanceHistoryLength(account4);
    for (i = 0; i < balanceHistoryLength; i++) {
      var e = contract.balanceHistory(account4, i);
      console.log("RESULT: balanceHistory(" + account4 + ", " + i + ") = " + e[0] + " => " + e[1].shift(-decimals));
    }

    var balanceHistoryLength = contract.balanceHistoryLength(account5);
    for (i = 0; i < balanceHistoryLength; i++) {
      var e = contract.balanceHistory(account5, i);
      console.log("RESULT: balanceHistory(" + account5 + ", " + i + ") = " + e[0] + " => " + e[1].shift(-decimals));
    }
    */

    var approvalEvents = contract.Approval({}, { fromBlock: tokenFromBlock, toBlock: latestBlock });
    i = 0;
    approvalEvents.watch(function (error, result) {
      console.log("RESULT: Approval " + i++ + " #" + result.blockNumber + " _owner=" + result.args._owner + " _spender=" + result.args._spender + " _amount=" +
        result.args._amount.shift(-decimals));
    });
    approvalEvents.stopWatching();

    var transferEvents = contract.Transfer({}, { fromBlock: tokenFromBlock, toBlock: latestBlock });
    i = 0;
    transferEvents.watch(function (error, result) {
      console.log("RESULT: Transfer " + i++ + " #" + result.blockNumber + ": _from=" + result.args._from + " _to=" + result.args._to +
        " _amount=" + result.args._amount.shift(-decimals));
    });
    transferEvents.stopWatching();

    tokenFromBlock = parseInt(latestBlock) + 1;
  }
}
