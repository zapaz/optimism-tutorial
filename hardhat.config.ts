import { HardhatUserConfig } from 'hardhat/types'
import '@eth-optimism/plugins/hardhat/compiler'
import '@eth-optimism/plugins/hardhat/ethers'

import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'

const config: HardhatUserConfig = {
  defaultNetwork: "kovanOVM",
  networks: {
    hardhat: {
      loggingEnabled: true,
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
        blockNumber: 11862587
      },
      accounts: [
        {
          privateKey: process.env.ACCOUNT_KEY,
          balance: "100000000000000000000",
        },
        {
          privateKey: process.env.ACCOUNT_KEY_2,
          balance: "100000000000000000000",
        },
        {
          privateKey: process.env.ACCOUNT_KEY_3,
          balance: "100000000000000000000",
        },
      ],
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.ACCOUNT_KEY, process.env.ACCOUNT_KEY_2, process.env.ACCOUNT_KEY_3]
    },
    kovanOVM: {
      url: `https://kovan.optimism.io`,
      accounts: [process.env.ACCOUNT_KEY, process.env.ACCOUNT_KEY_2, process.env.ACCOUNT_KEY_3]
    },
  },
  solidity: "0.7.3",
};

export default config
