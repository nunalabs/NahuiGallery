'use client';

import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { andeTestnet } from '@/lib/wagmi';

export function NetworkStatus() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  if (!isConnected) {
    return null;
  }

  const isCorrectNetwork = chainId === andeTestnet.id;

  if (isCorrectNetwork) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm">
        <div className="w-2 h-2 bg-green-500 rounded-full" />
        <span className="font-medium">ANDE Testnet</span>
      </div>
    );
  }

  return (
    <button
      onClick={() => switchChain?.({ chainId: andeTestnet.id })}
      className="flex items-center space-x-2 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/30 rounded-lg text-sm transition-colors"
    >
      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
      <span className="font-medium">Wrong Network</span>
    </button>
  );
}
