import { ethers } from 'ethers';

// ABI for ERC20 tokens (minimal interface needed for balances)
export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

// Common token addresses (Ethereum mainnet)
export const TOKENS = {
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
};

/**
 * Check if MetaMask is installed
 * @returns {boolean} Whether MetaMask is installed
 */
export const isMetaMaskInstalled = () => {
  return typeof window !== 'undefined' && window.ethereum !== undefined;
};

/**
 * Request access to the user's MetaMask account
 * @returns {Promise<string>} A promise that resolves to the user's address
 */
export const connectWallet = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }
  
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0];
  } catch (error) {
    throw new Error(`Error connecting to MetaMask: ${error.message}`);
  }
};

/**
 * Sign a message with the user's MetaMask account
 * @param {string} message - The message to sign
 * @returns {Promise<string>} A promise that resolves to the signature
 */
export const signMessage = async (message) => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }
  
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const signature = await signer.signMessage(message);
    return signature;
  } catch (error) {
    throw new Error(`Error signing message: ${error.message}`);
  }
};

/**
 * Get token balances for a specific address
 * @param {string} address - The address to check balances for
 * @returns {Promise<Object>} A promise that resolves to an object with token balances
 */
export const getTokenBalances = async (address) => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }
  
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // Get ETH balance
    const ethBalance = await provider.getBalance(address);
    const formattedEthBalance = ethers.utils.formatEther(ethBalance);
    
    // Get token balances
    const usdtContract = new ethers.Contract(TOKENS.USDT, ERC20_ABI, provider);
    const usdcContract = new ethers.Contract(TOKENS.USDC, ERC20_ABI, provider);
    
    const usdtDecimals = await usdtContract.decimals();
    const usdcDecimals = await usdcContract.decimals();
    
    const usdtBalance = await usdtContract.balanceOf(address);
    const usdcBalance = await usdcContract.balanceOf(address);
    
    const formattedUsdtBalance = ethers.utils.formatUnits(usdtBalance, usdtDecimals);
    const formattedUsdcBalance = ethers.utils.formatUnits(usdcBalance, usdcDecimals);
    
    return {
      ETH: formattedEthBalance,
      USDT: formattedUsdtBalance,
      USDC: formattedUsdcBalance
    };
  } catch (error) {
    throw new Error(`Error fetching balances: ${error.message}`);
  }
};

/**
 * Add MetaMask event listeners
 * @param {Function} accountsChangedCallback - Callback for when accounts change
 * @param {Function} chainChangedCallback - Callback for when the chain changes
 * @param {Function} disconnectCallback - Callback for when the wallet disconnects
 */
export const addWalletListeners = (accountsChangedCallback, chainChangedCallback, disconnectCallback) => {
  if (!isMetaMaskInstalled()) {
    return;
  }
  
  // Listen for account changes
  window.ethereum.on('accountsChanged', accountsChangedCallback);
  
  // Listen for chain changes
  window.ethereum.on('chainChanged', chainChangedCallback);
  
  // Listen for disconnect
  window.ethereum.on('disconnect', disconnectCallback);
};

/**
 * Remove MetaMask event listeners
 */
export const removeWalletListeners = (accountsChangedCallback, chainChangedCallback, disconnectCallback) => {
  if (!isMetaMaskInstalled()) {
    return;
  }
  
  window.ethereum.removeListener('accountsChanged', accountsChangedCallback);
  window.ethereum.removeListener('chainChanged', chainChangedCallback);
  window.ethereum.removeListener('disconnect', disconnectCallback);
};
