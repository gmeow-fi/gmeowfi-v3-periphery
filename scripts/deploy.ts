import { ethers } from 'hardhat'
import { ContractFactory, Contract } from 'ethers'
import { deployContract, deployContractWithArtifact } from './helper'
import {
  NFTDescriptor,
  TransparentUpgradeableProxy,
  NonfungibleTokenPositionDescriptor,
  ProxyAdmin,
  NonfungiblePositionManager,
} from '../typechain-types'

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying contracts with the account:', deployer.address)

  const wethLabelHex = ethers.encodeBytes32String('WETH')
  const v3Factory = {
    address: '0xaE218256bB7aD772F04c78D5fCb64E9AC73A22DA',
  }

  const weth = await ethers.getContractAt('IERC20', '0x4200000000000000000000000000000000000006')

  // const swapRouter = await deployContract('SwapRouter', [v3Factory.address, await weth.getAddress()], 'SwapRouter', {})
  const swapRouter = await ethers.getContractAt('SwapRouter', '0x73c489cbf37CbADb4102E57C43C51C2105095E7D')
  // const nftDescriptor = await deployContract<NFTDescriptor>('NFTDescriptor', [], 'NFTDescriptor', {})
  const nftDescriptor = await ethers.getContractAt('NFTDescriptor', '0x6FE99b9979Fe66913042c5B84144D44de8fBBbED')

  // const proxyAdmin = await deployContract<ProxyAdmin>('ProxyAdmin', [], 'ProxyAdmin', {})
  const proxyAdmin = await ethers.getContractAt('ProxyAdmin', '0xa5aF797aA833025aC5C79F5B4612D5a71C78E810')

  // const nftPositionDescriptor = await deployContract<NonfungibleTokenPositionDescriptor>(
  //   'NonfungibleTokenPositionDescriptor',
  //   [await weth.getAddress(), wethLabelHex],
  //   'NonfungibleTokenPositionDescriptor',
  //   {
  //     libraries: {
  //       NFTDescriptor: await nftDescriptor.getAddress(),
  //     },
  //   }
  // )
  const nftPositionDescriptor = await ethers.getContractAt(
    'NonfungibleTokenPositionDescriptor',
    '0xF3610490Cfe9E4dd622F439b6a95bcFA33975e07'
  )

  const nftPositionDescriptorProxy = await deployContract<TransparentUpgradeableProxy>(
    'TransparentUpgradeableProxy',
    [await nftPositionDescriptor.getAddress(), await proxyAdmin.getAddress(), '0x'],
    'NonfungibleTokenPositionDescriptorProxy',
    {}
  )
  // const nftPositionDescriptorProxy = await ethers.getContractAt(
  //   'NonfungibleTokenPositionDescriptor',
  //   '0x22a38B643c1eeB39E6804434d43605aE946bedAc'
  // )
  const nftPositionManager = await deployContract<NonfungiblePositionManager>(
    'NonfungiblePositionManager',
    [v3Factory.address, await weth.getAddress(), await nftPositionDescriptorProxy.getAddress()],
    'NonfungiblePositionManager',
    {}
  )
  const quoterV2 = await deployContract('QuoterV2', [v3Factory.address, await weth.getAddress()], 'QuoterV2', {})
  const tickLens = await deployContract('TickLens', [], 'TickLens', {})
  const uniswapInteraceMulticall = await deployContract(
    'UniswapInterfaceMulticall',
    [],
    'UniswapInterfaceMulticall',
    {}
  )

  const quoter = await deployContract('Quoter', [v3Factory.address, await weth.getAddress()], 'Quoter', {})
  const v3Migrator = await deployContract(
    'V3Migrator',
    [v3Factory.address, await weth.getAddress(), await nftPositionManager.getAddress()],
    'V3Migrator',
    {}
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
