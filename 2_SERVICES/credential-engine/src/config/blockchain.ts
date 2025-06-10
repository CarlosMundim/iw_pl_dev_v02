import { ethers } from 'ethers';
import Web3 from 'web3';
import { logger } from '@/utils/logger';

interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

class BlockchainConfig {
  private providers: Map<string, ethers.JsonRpcProvider> = new Map();
  private web3Instances: Map<string, Web3> = new Map();
  private contracts: Map<string, ethers.Contract> = new Map();

  private readonly chains: Record<string, ChainConfig> = {
    ethereum: {
      chainId: 1,
      name: 'Ethereum Mainnet',
      rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/your-key',
      explorerUrl: 'https://etherscan.io',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
    },
    sepolia: {
      chainId: 11155111,
      name: 'Sepolia Testnet',
      rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/your-key',
      explorerUrl: 'https://sepolia.etherscan.io',
      nativeCurrency: { name: 'Sepolia Ether', symbol: 'SEP ETH', decimals: 18 }
    },
    polygon: {
      chainId: 137,
      name: 'Polygon Mainnet',
      rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
      explorerUrl: 'https://polygonscan.com',
      nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 }
    },
    mumbai: {
      chainId: 80001,
      name: 'Polygon Mumbai',
      rpcUrl: process.env.MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
      explorerUrl: 'https://mumbai.polygonscan.com',
      nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 }
    }
  };

  // Contract ABIs (simplified for demo)
  private readonly credentialRegistryABI = [
    'function issueCredential(address holder, string credentialType, bytes32 dataHash, uint256 expiresAt) external returns (bytes32)',
    'function verifyCredential(bytes32 credentialId) external view returns (bool)',
    'function revokeCredential(bytes32 credentialId) external',
    'function getCredential(bytes32 credentialId) external view returns (tuple(bytes32 id, address issuer, address holder, string credentialType, bytes32 dataHash, uint256 issuedAt, uint256 expiresAt, bool revoked))',
    'function isAuthorizedIssuer(address issuer) external view returns (bool)',
    'function addAuthorizedIssuer(address issuer) external',
    'function removeAuthorizedIssuer(address issuer) external',
    'event CredentialIssued(bytes32 indexed credentialId, address indexed issuer, address indexed holder)',
    'event CredentialRevoked(bytes32 indexed credentialId, address indexed issuer)',
    'event IssuerAuthorized(address indexed issuer)',
    'event IssuerRevoked(address indexed issuer)'
  ];

  private readonly contractAddresses = {
    ethereum: {
      credentialRegistry: process.env.ETHEREUM_CREDENTIAL_REGISTRY || '0x1234567890abcdef1234567890abcdef12345678'
    },
    polygon: {
      credentialRegistry: process.env.POLYGON_CREDENTIAL_REGISTRY || '0xabcdef1234567890abcdef1234567890abcdef12'
    },
    sepolia: {
      credentialRegistry: process.env.SEPOLIA_CREDENTIAL_REGISTRY || '0x1111222233334444555566667777888899990000'
    },
    mumbai: {
      credentialRegistry: process.env.MUMBAI_CREDENTIAL_REGISTRY || '0x0000999988887777666655554444333322221111'
    }
  };

  async initialize(): Promise<void> {
    try {
      // Initialize providers for each chain
      for (const [chainName, config] of Object.entries(this.chains)) {
        // Create ethers provider
        const provider = new ethers.JsonRpcProvider(config.rpcUrl);
        this.providers.set(chainName, provider);

        // Create Web3 instance
        const web3 = new Web3(config.rpcUrl);
        this.web3Instances.set(chainName, web3);

        // Test connection
        await provider.getBlockNumber();
        logger.info(`✅ Connected to ${config.name}`);

        // Initialize contracts if address exists
        const contractAddress = this.contractAddresses[chainName as keyof typeof this.contractAddresses]?.credentialRegistry;
        if (contractAddress && contractAddress !== '0x1234567890abcdef1234567890abcdef12345678') {
          const contract = new ethers.Contract(contractAddress, this.credentialRegistryABI, provider);
          this.contracts.set(`${chainName}-credential-registry`, contract);
          logger.info(`📄 Contract initialized for ${config.name}: ${contractAddress}`);
        }
      }

      logger.info('🔗 Blockchain configuration initialized');
    } catch (error) {
      logger.error('❌ Blockchain initialization failed:', error);
      throw error;
    }
  }

  getProvider(chain: string): ethers.JsonRpcProvider {
    const provider = this.providers.get(chain);
    if (!provider) {
      throw new Error(`Provider not found for chain: ${chain}`);
    }
    return provider;
  }

  getWeb3(chain: string): Web3 {
    const web3 = this.web3Instances.get(chain);
    if (!web3) {
      throw new Error(`Web3 instance not found for chain: ${chain}`);
    }
    return web3;
  }

  getContract(chain: string, contractType: string): ethers.Contract {
    const contract = this.contracts.get(`${chain}-${contractType}`);
    if (!contract) {
      throw new Error(`Contract not found: ${chain}-${contractType}`);
    }
    return contract;
  }

  getWallet(chain: string): ethers.Wallet {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('Private key not configured');
    }

    const provider = this.getProvider(chain);
    return new ethers.Wallet(privateKey, provider);
  }

  async getChainInfo(chain: string): Promise<any> {
    try {
      const provider = this.getProvider(chain);
      const blockNumber = await provider.getBlockNumber();
      const network = await provider.getNetwork();
      const gasPrice = await provider.getFeeData();

      return {
        chain: this.chains[chain].name,
        chainId: Number(network.chainId),
        blockNumber,
        gasPrice: {
          gasPrice: gasPrice.gasPrice?.toString(),
          maxFeePerGas: gasPrice.maxFeePerGas?.toString(),
          maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas?.toString()
        }
      };
    } catch (error) {
      logger.error(`Error getting chain info for ${chain}:`, error);
      throw error;
    }
  }

  async estimateGas(chain: string, contractType: string, method: string, params: any[]): Promise<bigint> {
    try {
      const contract = this.getContract(chain, contractType);
      const wallet = this.getWallet(chain);
      const contractWithSigner = contract.connect(wallet);

      return await contractWithSigner[method].estimateGas(...params);
    } catch (error) {
      logger.error(`Gas estimation failed for ${method}:`, error);
      throw error;
    }
  }

  async waitForTransaction(chain: string, txHash: string, confirmations: number = 1): Promise<any> {
    try {
      const provider = this.getProvider(chain);
      const receipt = await provider.waitForTransaction(txHash, confirmations);
      return receipt;
    } catch (error) {
      logger.error(`Transaction wait failed for ${txHash}:`, error);
      throw error;
    }
  }

  async checkHealth(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};

    for (const [chainName, config] of Object.entries(this.chains)) {
      try {
        const provider = this.providers.get(chainName);
        if (provider) {
          await provider.getBlockNumber();
          health[chainName] = true;
        } else {
          health[chainName] = false;
        }
      } catch {
        health[chainName] = false;
      }
    }

    return health;
  }

  getSupportedChains(): string[] {
    return Object.keys(this.chains);
  }

  getChainConfig(chain: string): ChainConfig {
    const config = this.chains[chain];
    if (!config) {
      throw new Error(`Chain configuration not found: ${chain}`);
    }
    return config;
  }
}

export const blockchain = new BlockchainConfig();