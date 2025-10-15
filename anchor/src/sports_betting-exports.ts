import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import SportsBettingIDL from '../target/idl/sports_bet.json'
import type { SportsBet } from '../target/types/sports_bet'

export { SportsBettingIDL, SportsBet }

export const SPORTS_BETTING_PROGRAM_ID = new PublicKey(
  SportsBettingIDL.address // same as "Count3AcZucF…"
)

export function getSportsBettingProgram(
  provider: AnchorProvider,
  address?: PublicKey
): Program<SportsBet> {
  return new Program(
    { ...SportsBettingIDL, address: (address ?? SPORTS_BETTING_PROGRAM_ID).toBase58() } as SportsBet,
    provider
  )
}

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