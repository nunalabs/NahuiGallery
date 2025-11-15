import { createConfig, http } from 'wagmi';
import { walletConnect, injected, coinbaseWallet } from 'wagmi/connectors';
import { andeTestnet } from './config';

// WalletConnect Project ID
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

if (!projectId && typeof window !== 'undefined') {
  console.warn('Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID');
}

// Wagmi configuration
export const config = createConfig({
  chains: [andeTestnet],
  transports: {
    [andeTestnet.id]: http(),
  },
  connectors: [
    walletConnect({ projectId, showQrModal: false }),
    injected({ shimDisconnect: true }),
    coinbaseWallet({
      appName: 'NahuiGallery',
      appLogoUrl: 'https://nahuigallery.art/logo.png',
    }),
  ],
  ssr: true,
});

// Metadata
export const metadata = {
  name: 'NahuiGallery',
  description: 'Premium NFT Platform on ANDE Network',
  url: 'https://nahuigallery.art',
  icons: ['https://nahuigallery.art/favicon.ico'],
};

export { andeTestnet };
