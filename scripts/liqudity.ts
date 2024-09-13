import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

async function main() {
    const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; // Uniswap V2 Router
    const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC token
    const LISK = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // LISK token
    const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621"; // Impersonate this account to get tokens

    await helpers.impersonateAccount(TOKEN_HOLDER);
    const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);

    const amountADesired = ethers.parseUnits("2", 6); // Desired USDC amount (6 decimals)
    const amountBDesired = ethers.parseUnits("2", 18); // Desired LISK amount (18 decimals)
    const amountAMin = ethers.parseUnits("1", 6); // Minimum USDC you're willing to add
    const amountBMin = ethers.parseUnits("1", 18); // Minimum LISK you're willing to add

    const USDC_Contract = await ethers.getContractAt("IERC20", USDC, impersonatedSigner);
    const LISK_Contract = await ethers.getContractAt("IERC20", LISK, impersonatedSigner);

    const ROUTER = await ethers.getContractAt("IUniswapV2Router", ROUTER_ADDRESS, impersonatedSigner);

    // Approve Router to spend USDC and LISK
    await USDC_Contract.approve(ROUTER_ADDRESS, amountADesired);
    await LISK_Contract.approve(ROUTER_ADDRESS, amountBDesired);

    const usdcBalBefore = await USDC_Contract.balanceOf(impersonatedSigner.address);
    const liskBalBefore = await LISK_Contract.balanceOf(impersonatedSigner.address);

    console.log("USDC balance before add liquidity:", Number(usdcBalBefore));
    console.log("LISK balance before add liquidity:", Number(liskBalBefore));

    const deadline = Math.floor(Date.now() / 1000) + (60 * 10); // Transaction deadline (10 minutes)

    // Add Liquidity
    const tx = await ROUTER.addLiquidity(
        USDC, // Token A (USDC)
        LISK, // Token B (LISK)
        amountADesired, // Desired USDC amount
        amountBDesired, // Desired LISK amount
        amountAMin, // Minimum USDC you're willing to add
        amountBMin, // Minimum LISK you're willing to add
        impersonatedSigner.address, // The address that will receive the liquidity tokens
        deadline // Deadline for transaction
    );

    await tx.wait(); // Wait for transaction to be mined

    const usdcBalAfter = await USDC_Contract.balanceOf(impersonatedSigner.address);
    const liskBalAfter = await LISK_Contract.balanceOf(impersonatedSigner.address);

    console.log("=========================================================");
    console.log("USDC balance after add liquidity:", Number(usdcBalAfter));
    console.log("LISK balance after add liquidity:", Number(liskBalAfter));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
