const HDWalletProvider = require('truffle-hdwallet-provider')

module.exports = {
  compilers: {
    solc: {
      version: '0.4.24',
    },
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      gasPrice: 0x00,
      network_id: '1337',
      websockets: true,
    },
    mintnet: {
      provider: () => {
        return new HDWalletProvider(
          process.env.ETHEREUM_DEPLOYER_SEED ||
            'robot robot robot robot robot robot robot robot robot robot robot robot',
          process.env.ETHEREUM_MINTNET_URL || 'https://mintnet.settlemint.com'
        )
      },
      gasPrice: 0x00,
      network_id: '8995',
      websockets: true,
    },
    minttestnet: {
      provider: () => {
        return new HDWalletProvider(
          process.env.ETHEREUM_DEPLOYER_SEED ||
            'robot robot robot robot robot robot robot robot robot robot robot robot',
          'https://minttestnet.settlemint.com'
        )
      },
      gasPrice: 0x00,
      network_id: '8996',
      websockets: true,
    },
    kovan: {
      provider: () => {
        return new HDWalletProvider(
          process.env.ETHEREUM_DEPLOYER_SEED,
          'https://kovan.infura.io/'
        )
      },
      network_id: '42',
      gas: 4700000,
    },
    ropsten: {
      provider: () => {
        return new HDWalletProvider(
          process.env.ETHEREUM_DEPLOYER_SEED,
          'https://ropsten.infura.io/'
        )
      },
      network_id: '3',
    },
    rinkeby: {
      provider: () => {
        return new HDWalletProvider(
          process.env.ETHEREUM_DEPLOYER_SEED,
          'https://rinkeby.infura.io/'
        )
      },
      network_id: '4',
    },
  },
}
