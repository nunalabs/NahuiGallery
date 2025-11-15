import { ConnectButton } from '@/components/web3/ConnectButton';
import { NetworkStatus } from '@/components/web3/NetworkStatus';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-dark border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <span className="text-2xl font-bold gradient-text">NahuiGallery</span>
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/explore"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Explore
              </Link>
              <Link
                href="/create"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Create
              </Link>
              <Link
                href="/artists"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Artists
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <NetworkStatus />
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-secondary-500/10 to-accent-500/10" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight animate-fade-in">
              Discover Premium NFT Art on{' '}
              <span className="gradient-text">ANDE Network</span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 animate-slide-up">
              Ultra-low fees, instant confirmations, automatic royalties. Built for
              artists, collectors, and creators.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
              <Link href="/explore" className="btn-primary w-full sm:w-auto">
                Explore Marketplace
              </Link>
              <Link href="/create" className="btn-outline w-full sm:w-auto">
                Create NFT
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-12 animate-scale-in">
              <div className="space-y-2">
                <div className="text-3xl font-bold gradient-text">~$0.001</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Average Gas Fee
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold gradient-text">&lt; 2s</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Confirmation Time
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold gradient-text">10%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Artist Royalties
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why <span className="gradient-text">NahuiGallery</span>?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl glass hover:scale-105 transition-transform duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 opacity-10" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl font-bold">Ready to Start Creating?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Join NahuiGallery and showcase your art to the world
            </p>
            <Link href="/create" className="btn-primary inline-block">
              Create Your First NFT
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg" />
                <span className="text-xl font-bold text-white">NahuiGallery</span>
              </div>
              <p className="text-sm">
                Premium NFT platform on ANDE Network. Built for artists.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Marketplace</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/explore">Explore</Link></li>
                <li><Link href="/create">Create</Link></li>
                <li><Link href="/artists">Artists</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/docs">Documentation</Link></li>
                <li><Link href="/faq">FAQ</Link></li>
                <li><Link href="/support">Support</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Community</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://twitter.com/NahuiGallery" target="_blank" rel="noopener">Twitter</a></li>
                <li><a href="https://discord.gg/nahuigallery" target="_blank" rel="noopener">Discord</a></li>
                <li><a href="https://github.com/nunalabs/NahuiGallery" target="_blank" rel="noopener">GitHub</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
            <p>&copy; 2025 NahuiGallery by Nuna Labs. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

const features = [
  {
    icon: '⚡',
    title: 'Ultra-Low Fees',
    description: 'Gas fees as low as $0.001 per transaction on ANDE Network',
  },
  {
    icon: '🚀',
    title: 'Instant Confirmations',
    description: 'Near-instant transaction confirmations in under 2 seconds',
  },
  {
    icon: '💰',
    title: 'Automatic Royalties',
    description: 'Earn 10% on every secondary sale, enforced on-chain',
  },
  {
    icon: '🎨',
    title: 'Curated Marketplace',
    description: 'Quality over quantity - premium art and verified artists',
  },
  {
    icon: '🌍',
    title: 'Global Reach',
    description: 'Connect with collectors worldwide on a decentralized platform',
  },
  {
    icon: '🔒',
    title: 'Secure & Audited',
    description: 'Smart contracts audited by top security firms',
  },
];
