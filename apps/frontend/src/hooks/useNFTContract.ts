import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther, type Address } from 'viem';

// NFT Contract ABI (minimal for now, will be generated from TypeChain)
const NFT_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: 'quantity', type: 'uint256' }],
    name: 'mint',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'mintPrice',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalMinted',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'maxSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export function useNFTContract(contractAddress?: Address) {
  // Read mint price
  const { data: mintPrice } = useReadContract({
    address: contractAddress,
    abi: NFT_ABI,
    functionName: 'mintPrice',
    query: {
      enabled: !!contractAddress,
    },
  });

  // Read total minted
  const { data: totalMinted } = useReadContract({
    address: contractAddress,
    abi: NFT_ABI,
    functionName: 'totalMinted',
    query: {
      enabled: !!contractAddress,
    },
  });

  // Read max supply
  const { data: maxSupply } = useReadContract({
    address: contractAddress,
    abi: NFT_ABI,
    functionName: 'maxSupply',
    query: {
      enabled: !!contractAddress,
    },
  });

  // Write: Mint NFT
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const mint = (quantity: number) => {
    if (!contractAddress || !mintPrice) return;

    const totalCost = BigInt(quantity) * mintPrice;

    writeContract({
      address: contractAddress,
      abi: NFT_ABI,
      functionName: 'mint',
      args: [BigInt(quantity)],
      value: totalCost,
    });
  };

  return {
    // Read data
    mintPrice: mintPrice ? formatEther(mintPrice) : '0',
    mintPriceWei: mintPrice,
    totalMinted: totalMinted ? Number(totalMinted) : 0,
    maxSupply: maxSupply ? Number(maxSupply) : 0,
    // Write functions
    mint,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}
