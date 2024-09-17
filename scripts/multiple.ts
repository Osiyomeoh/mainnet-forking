import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

async function main() {
    const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; // Uniswap V2 Router Address
    const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC Address
    const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";  // DAI Address
    const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621"; // Address to Impersonate (USDC holder)

    await helpers.impersonateAccount(TOKEN_HOLDER);
    const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);

    const amountIn = ethers.parseUnits("1", 6); // Example amount for swaps (1 USDC)
    const amountOutMin = ethers.parseUnits("0.9", 18); // Minimum DAI expected (0.9 DAI)
    const amountInMax = ethers.parseUnits("2", 6); // Max USDC willing to pay
    const amountOut = ethers.parseUnits("1", 18); // Exact amount of DAI expected

    const path = [USDC, DAI]; // Swap path
    const deadline = Math.floor(Date.now() / 1000) + (60 * 10); // 10 minute deadline
    
    const USDC_Contract = await ethers.getContractAt("IERC20", USDC, impersonatedSigner);
    const DAI_Contract = await ethers.getContractAt("IERC20", DAI, impersonatedSigner);
    const ROUTER = await ethers.getContractAt("IUniswapV2Router", ROUTER_ADDRESS, impersonatedSigner);

    // Approve Router to spend USDC and DAI
    await USDC_Contract.approve(ROUTER_ADDRESS, amountInMax);
    await DAI_Contract.approve(ROUTER_ADDRESS, amountOutMin);

    // SwapExactTokensForTokens
    console.log("Executing swapExactTokensForTokens...");
    const tx1 = await ROUTER.swapExactTokensForTokens(
        amountIn,
        amountOutMin,
        path,
        impersonatedSigner.address,
        deadline
    );
    await tx1.wait();
    console.log("swapExactTokensForTokens executed successfully.");

    // SwapTokensForExactTokens
    console.log("Executing swapTokensForExactTokens...");
    const tx2 = await ROUTER.swapTokensForExactTokens(
        amountOut,
        amountInMax,
        path,
        impersonatedSigner.address,
        deadline
    );
    await tx2.wait();
    console.log("swapTokensForExactTokens executed successfully.");

    // SwapTokensForExactETH
    console.log("Executing swapTokensForExactETH...");
    const tx3 = await ROUTER.swapTokensForExactETH(
        ethers.parseUnits("0.1", 18), // amountOut (ETH)
        ethers.parseUnits("2", 6), // amountInMax (USDC)
        path,
        impersonatedSigner.address,
        deadline
    );
    await tx3.wait();
    console.log("swapTokensForExactETH executed successfully.");

    // Add Liquidity
    const amountADesired = ethers.parseUnits("2", 6); // USDC
    const amountBDesired = ethers.parseUnits("2", 18); // DAI
    const amountAMin = ethers.parseUnits("1", 6); // USDC Min
    const amountBMin = ethers.parseUnits("1", 18); // DAI Min

    console.log("Adding liquidity...");
    const tx4 = await ROUTER.addLiquidity(
        USDC,
        DAI,
        amountADesired,
        amountBDesired,
        amountAMin,
        amountBMin,
        impersonatedSigner.address,
        deadline
    );
    await tx4.wait();
    console.log("Liquidity added successfully.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
