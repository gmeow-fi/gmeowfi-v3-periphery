import { ethers } from 'hardhat'
import { ContractFactory, Contract } from 'ethers'
import { deployContract, deployContractWithArtifact } from './helper'
import TransparentUpgradeableProxy from '@openzeppelin/contracts/build/contracts/TransparentUpgradeableProxy.json'
import ProxyAdmin from '@openzeppelin/contracts/build/contracts/ProxyAdmin.json'

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying contracts with the account:', deployer.address)

  const wethLabelHex = ethers.encodeBytes32String('WETH')
  const v3Factory = {
    address: '0x22Ae5d5a0Aa4d2763BE2A9090E1ea85E9BBE1f6b',
  }

  const weth = await ethers.getContractAt('IERC20', '0x4200000000000000000000000000000000000006')

  // const swapRouter = await deployContract(
  //   'SwapRouter',
  //   [v3Factory.address, await weth.getAddress()],
  //   'SwapRouter',
  //   {}
  // );
  //   const swapRouter = await ethers.getContractAt('SwapRouter', '0x9705d528B4567A4e093C4eFBE17EC0330FA090b1')
  // const nftDescriptor = await deployContract(
  //   'NFTDescriptor',
  //   [],
  //   'NFTDescriptor',
  //   {}
  // );
  //   const nftDescriptor = await ethers.getContractAt('NFTDescriptor', '0x51382276dc57E7d5e5dc4D9C71689d26b78f6b00')

  // const proxyAdmin = await deployContractWithArtifact(
  //   ProxyAdmin,
  //   [],
  //   'ProxyAdmin',
  //   {}
  // );
  //   const proxyAdmin = await ethers.getContractAt('ERC20', '0x134163976C055D445BD8882A4973411068C658C4')

  // const nftPositionDescriptor = await deployContract(
  //   'NonfungibleTokenPositionDescriptor',
  //   [await weth.getAddress(), wethLabelHex],
  //   'NonfungibleTokenPositionDescriptor',
  //   {
  //     libraries: {
  //       NFTDescriptor: await nftDescriptor.getAddress(),
  //     },
  //   }
  // );
  const nftPositionDescriptor = await ethers.getContractAt(
    'NonfungibleTokenPositionDescriptor',
    '0xc9CEAC64EDe99BF803b49EF9E19BCeC305C8b13a'
  )

  // const nftPositionDescriptorProxy = await deployContractWithArtifact(
  //   TransparentUpgradeableProxy,
  //   [
  //     await nftPositionDescriptor.getAddress(),
  //     await proxyAdmin.getAddress(),
  //     '0x',
  //   ],
  //   'NonfungibleTokenPositionDescriptorProxy',
  //   {}
  // );
  const nftPositionDescriptorProxy = await ethers.getContractAt(
    'NonfungibleTokenPositionDescriptor',
    '0x22a38B643c1eeB39E6804434d43605aE946bedAc'
  )
  const nftPositionManager = await deployContract(
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
