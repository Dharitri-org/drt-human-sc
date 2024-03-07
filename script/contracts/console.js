global.setup = async (networkChoice) => {
    global.moajs = require('@dharitrinetwork/moajs');
    let { moaSys, wallets } = await moajs.setupInteractive(networkChoice);
    global.moaSys = moaSys;
    for (walletName in wallets) {
        global[walletName] = wallets[walletName];
    }
    console.log(`Add this to the config.env:\nNETWORK_PROVIDER=${networkChoice}`);
}

global.issueToken = async (
    owner,
    initialAmount,
    name = 'HumanToken',
    identifier = 'HMT',
    decimals = 18
) => {
    let unissuedToken = moajs.createBalanceBuilder(new moajs.Token({ identifier, name, decimals, type: moajs.TokenType.Fungible }));
    global.humanToken = await moaSys.sender(owner).issueFungible(name, identifier, unissuedToken(initialAmount), decimals);
    console.log(`Add the token identifier to config.env:\nHUMAN_TOKEN_IDENTIFIER=${humanToken.getTokenIdentifier()}`);
}

global.recallToken = async (tokenIdentifier) => {
    global.humanToken = await moaSys.recallToken(tokenIdentifier);
}

global.deployJobTemplate = async (owner) => {
    let job = await moaSys.loadWrapper("job");
    await job.sender(owner).gas(130_000_000).call.deploy('-', owner, 0);
    console.log(`Add this to the config.env:\nJOB_TEMPLATE_ADDRESS=${job.getAddress().bech32()}`);
}

global.printKeys = (wallet) => {
    console.log(`public: "${wallet.address.bech32()}",`);
    console.log(`private: "${wallet.secretKey.toString('hex')}",`);
}

global.transferToken = async (from, to, amount) => {
    await moaSys.sender(from).value(humanToken(amount)).send(to);
}

global.checkBalance = async (wallet) => {
    await moaSys.getBalance(wallet, humanToken).then(moajs.print);
}
