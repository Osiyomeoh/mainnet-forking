import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

async function main() {
    const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; 
    const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; 
    const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; 
    const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621"; 

    await helpers.impersonateAccount(TOKEN_HOLDER);
    const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);

    const amountADesired = ethers.parseUnits("2", 6); 
    const amountBDesired = ethers.parseUnits("2", 18);
    const amountAMin = ethers.parseUnits("1", 6); 
    const amountBMin = ethers.parseUnits("1", 18); 

    const USDC_Contract = await ethers.getContractAt("IERC20", USDC, impersonatedSigner);
    const DAI_Contract = await ethers.getContractAt("IERC20", DAI, impersonatedSigner);

    const ROUTER = await ethers.getContractAt("IUniswapV2Router", ROUTER_ADDRESS, impersonatedSigner);

    // Approve Router to spend USDC and DAI
    await USDC_Contract.approve(ROUTER_ADDRESS, amountADesired);
    await DAI_Contract.approve(ROUTER_ADDRESS, amountBDesired);

    const usdcBalBefore = await USDC_Contract.balanceOf(impersonatedSigner.address);
    const daiBalBefore = await DAI_Contract.balanceOf(impersonatedSigner.address);

    console.log("USDC balance before add liquidity:", Number(usdcBalBefore));
    console.log("DAI balance before add liquidity:", Number(daiBalBefore));

    const deadline = Math.floor(Date.now() / 1000) + (60 * 10); 

    // Add Liquidity
    const tx = await ROUTER.addLiquidity(
        USDC, 
        DAI, 
        amountADesired, 
        amountBDesired, 
        amountAMin, 
        amountBMin, 
        impersonatedSigner.address, 
        deadline 
    );

    await tx.wait();

    const usdcBalAfter = await USDC_Contract.balanceOf(impersonatedSigner.address);
    const daiBalAfter = await DAI_Contract.balanceOf(impersonatedSigner.address);

    console.log("=========================================================");
    console.log("USDC balance after add liquidity:", Number(usdcBalAfter));
    console.log("DAI balance after add liquidity:", Number(daiBalAfter));
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
