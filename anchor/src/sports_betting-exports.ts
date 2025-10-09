import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'

// ⬇️  Path will be the same place Anchor writes every build.
//     After `anchor build`, you’ll have both of these files.
import SportsBettingIDL from '../target/idl/sports_betting.json'
import type { SportsBetting } from '../target/types/sports_betting'

// Re-export so the rest of the front-end can import from this one file.
export { SportsBettingIDL, SportsBetting }

// Static program ID baked into the on-chain binary (see `declare_id!` in lib.rs)
export const SPORTS_BETTING_PROGRAM_ID = new PublicKey(
  SportsBettingIDL.address // same as "Count3AcZucF…"
)

// Convenience wrapper so you don’t repeat the generics everywhere.
export function getSportsBettingProgram(
  provider: AnchorProvider,
  // optional override in case you deploy another instance
  address?: PublicKey
): Program<SportsBetting> {
  return new Program(
    { ...SportsBettingIDL, address: (address ?? SPORTS_BETTING_PROGRAM_ID).toBase58() } as SportsBetting,
    provider
  )
}

// If you want to switch RPC clusters at runtime (wallet adapters often expose this)
export function getSportsBettingProgramId(cluster: Cluster): PublicKey {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      return new PublicKey('Count3AcZucFDPSFBAeHkQ6AvttieKUkyJ8HiQGhQwe')
    case 'mainnet-beta':
    default:
      // change this when you deploy to mainnet
      return SPORTS_BETTING_PROGRAM_ID
  }
}
