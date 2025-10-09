import { AppHero } from '@/components/app-hero'
import Link from 'next/link';

const links: { label: string; href: string }[] = [
  { label: 'Solana Docs', href: 'https://docs.solana.com/' },
  { label: 'Solana Faucet', href: 'https://faucet.solana.com/' },
  { label: 'Solana Cookbook', href: 'https://solana.com/developers/cookbook/' },
  { label: 'Solana Stack Overflow', href: 'https://solana.stackexchange.com/' },
  { label: 'Solana Developers GitHub', href: 'https://github.com/solana-developers/' },
]

export function DashboardFeature() {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <AppHero title="The Betting Nest" subtitle="Made by Daniel Gao" />
      <Link href="/bet" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-300 disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none">
        Get Started
      </Link>

    </div>
  )
}
