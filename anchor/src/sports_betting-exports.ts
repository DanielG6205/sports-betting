import { AnchorProvider, Program, Idl, Address } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import SportsBettingIDL from '../target/idl/sports_betting.json'
import type { SportsBetting } from '../target/types/sports_betting'

export const SPORTS_BETTING_PROGRAM_ID = new PublicKey(SportsBettingIDL.address)

export function getSportsBettingProgram(
  provider: AnchorProvider,
  address?: PublicKey
): Program<SportsBetting> {
  const programId: PublicKey = address ?? SPORTS_BETTING_PROGRAM_ID
  return new Program<SportsBetting>(
    SportsBettingIDL as Idl,
    programId as Address, // ✅ cast fixes the squiggly
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
      return SPORTS_BETTING_PROGRAM_ID
  }
}