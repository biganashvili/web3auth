import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ConnectWallet = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const connectWallet = async () => {
    setIsConnecting(true);
    setError('');
    
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask and try again.');
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      
      // Get nonce from backend
      const nonceResponse = await axios.get(`/api/auth/nonce?address=${address}`);
      const nonce = nonceResponse.data.nonce;
      
      // Create message to sign
      const message = `Sign this message to verify your wallet ownership: ${nonce}`;
      
      // Get provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Sign message
      const signature = await signer.signMessage(message);
      
      // Verify signature on backend
      const verifyResponse = await axios.post('/api/auth/verify', {
        address,
        signature,
        message
      });
      
      // If verification is successful, we get a JWT token back
      const { token } = verifyResponse.data;
      
      // Store token in localStorage
      localStorage.setItem('authToken', token);
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Web3 Authentication</h1>
        
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
        >
          {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
        </button>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectWallet;
