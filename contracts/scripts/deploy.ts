import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with:', deployer.address);

  const Factory = await ethers.getContractFactory('LandSaleAnchor');
  const contract = await Factory.deploy(deployer.address);
  await contract.waitForDeployment();
  const addr = await contract.getAddress();
  console.log('LandSaleAnchor:', addr);
  console.log('Set REGISTRAR to this wallet or call setRegistrar(newKey) if using a separate backend key.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
