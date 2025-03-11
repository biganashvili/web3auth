import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// ABI for ERC20 token interface (minimal)
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

// Token addresses on Ethereum mainnet
const TOKENS = {
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
};

const Dashboard = () => {
  const [address, setAddress] = useState('');
  const [balances, setBalances] = useState({
    ETH: '0',
    USDT: '0',
    USDC: '0'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/');
        return;
      }

      // Set token in axios defaults for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      try {
        // Get user data from backend
        const response = await axios.get('/api/user');
        setAddress(response.data.address);
        
        // Fetch balances
        await fetchBalances(response.data.address);
      } catch (err) {
        console.error('Auth error:', err);
        localStorage.removeItem('authToken');
        navigate('/');
      }
    };

    checkAuth();
  }, [navigate]);

  const fetchBalances = async (address) => {
    setLoading(true);
    setError('');
    
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not available');
      }

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
      
      setBalances({
        ETH: formattedEthBalance,
        USDT: formattedUsdtBalance,
        USDC: formattedUsdcBalance
      });
    } catch (err) {
      console.error('Error fetching balances:', err);
      setError('Failed to fetch balances. Please refresh the page and try again.');
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  const renderBalanceCard = (token, amount) => (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-gray-900">{token}</h3>
      <p className="mt-2 text-2xl font-bold text-gray-900">{parseFloat(amount).toFixed(6)}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Wallet Dashboard</h1>
            <button
              onClick={disconnect}
              className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Disconnect
            </button>
          </div>
          
          <div className="mt-4">
            <p className="text-gray-600">Connected Address:</p>
            <p className="font-mono text-sm break-all">{address}</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading balances...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-4">Token Balances</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderBalanceCard('ETH', balances.ETH)}
              {renderBalanceCard('USDT', balances.USDT)}
              {renderBalanceCard('USDC', balances.USDC)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
