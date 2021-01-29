import { expect } from './setup'

import hre, { ethers } from 'hardhat'
import { Contract, Signer } from 'ethers'

describe('Layer 1 <> Layer 2 ERC20 Transfers', () => {
  const l2ethers = (hre as any).l2ethers

  // `l2account1` will have the same private key as `l1account1`, just a different provider.
  let l1account1: Signer
  let l2account1: Signer
  before(async () => {
    ;[l1account1] = await ethers.getSigners()
    ;[l2account1] = await l2ethers.getSigners()
  })

  const name = 'Some Really Cool Token Name'
  const initialSupply = 10000000

  // Create all the contracts.
  let L1_ERC20: Contract
  let L1_ERC20Adapter: Contract
  let L2_ERC20: Contract
  beforeEach(async () => {
    L1_ERC20 = await (await ethers.getContractFactory('ERC20'))
      .connect(l1account1)
      .deploy(initialSupply, name)

    L1_ERC20Adapter = await (await ethers.getContractFactory('L1_ERC20Adapter'))
      .connect(l1account1)
      .deploy(L1_ERC20.address)
    
    // Deploy the Layer 2 ERC20 without an initial supply.
    L2_ERC20 = await (await l2ethers.getContractFactory('L2_ERC20'))
      .connect(l2account1)
      .deploy(0, name)
  })

  // Initialize the bridges.
  beforeEach(async () => {
    await L1_ERC20Adapter.createBridge(
      L2_ERC20.address,
      l2ethers.contracts.L1CrossDomainMessenger.address
    )

    await L2_ERC20.createBridge(
      L1_ERC20Adapter.address,
      l2ethers.contracts.L2CrossDomainMessenger.address
    )
  })

  it('should do the full flow', async () => {
    const amount = 2500000

    // Start by moving funds into Layer 2.
    // Approve some funds to be deposited.
    await L1_ERC20.connect(l1account1).approve(
      L1_ERC20Adapter.address,
      amount
    )

    // Now actually transfer the funds to Layer 2.
    const receipt1 = await L1_ERC20Adapter.connect(l1account1).deposit(
      amount
    )
    
    // Wait for the message to be sent to Layer 2.
    await l2ethers.waitForBridgeRelay(receipt1)

    // Balance on Layer 1 should be original minus the deposited amount.
    expect(
      await L1_ERC20.balanceOf(
        await l1account1.getAddress()
      )
    ).to.equal(initialSupply - amount)

    // Should have a balance on Layer 2 now!
    expect(
      await L2_ERC20.balanceOf(
        await l2account1.getAddress()
      )
    ).to.equal(amount)

    // Now try to withdraw the funds.
    const receipt2 = await L2_ERC20.connect(l2account1).withdraw(
      amount
    )

    // Wait for the message to be relayed to Layer 1.
    await l2ethers.waitForBridgeRelay(receipt2)

    // Balance on Layer 1 should be back to original amount.
    expect(
      await L1_ERC20.balanceOf(
        await l1account1.getAddress()
      )
    ).to.equal(initialSupply)

    // Balance on Layer 2 should be back to zero.
    expect(
      await L2_ERC20.balanceOf(
        await l2account1.getAddress()
      )
    ).to.equal(0)
  })
})
