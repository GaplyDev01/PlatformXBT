/**
 * Utility functions for blockchain operations
 */

/**
 * Detects blockchain type from wallet address format
 * @param address Public key/wallet address to analyze
 * @returns Detected blockchain type or 'unknown'
 */
export const detectBlockchainFromAddress = (address: string): string => {
  // Clean the address
  const cleanAddress = address.trim();
  
  // Ethereum and EVM compatible chains - starts with 0x followed by 40 hex chars
  if (/^0x[a-fA-F0-9]{40}$/.test(cleanAddress)) {
    return 'ethereum';
  }
  
  // Solana - 32-44 alphanumeric characters, base58 encoding
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(cleanAddress)) {
    return 'solana';
  }
  
  // Bitcoin - starts with 1, 3, or bc1
  if (/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/.test(cleanAddress)) {
    return 'bitcoin';
  }
  
  // Polkadot - starts with 1 and 47-48 characters, Kusama would start with a different prefix
  if (/^[1-9A-HJ-NP-Za-km-z]{46,48}$/.test(cleanAddress)) {
    return 'polkadot';
  }
  
  return 'unknown';
};

/**
 * Verifies if an address is valid for any supported blockchain
 * @param address Public key/wallet address to validate
 * @returns Boolean indicating if the address format is valid
 */
export const isValidBlockchainAddress = (address: string): boolean => {
  return detectBlockchainFromAddress(address) !== 'unknown';
}; 