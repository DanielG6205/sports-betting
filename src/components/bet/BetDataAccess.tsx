/* ------------------------------------------------------------------ *
 *  BetDataAccess.tsx – typed hooks for the sports_betting program    *
 * ------------------------------------------------------------------ */
'use client'

import { BN } from '@coral-xyz/anchor'
import { PublicKey, SystemProgram, Cluster } from '@solana/web3.js'
import { useConnection } from '@solana/wallet-adapter-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { toast } from 'sonner'

import {
  getSportsBettingProgram,
  getSportsBettingProgramId,
} from '@project/anchor'

import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../use-transaction-toast'

/* ================================================================== */
/*  Hook #1 – program-wide (list games, create game)                  */
/* ================================================================== */
export function useSportsBettingProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const provider = useAnchorProvider()
  const txToast = useTransactionToast()

  /* ------------ Program ID & typed Program ------------ */
  const programId = useMemo(
    () => getSportsBettingProgramId(cluster.network as Cluster),
    [cluster],
  )
  const program = useMemo(
    () => getSportsBettingProgram(provider, programId),
    [provider, programId],
  )

  /* --------------------- Queries ---------------------- */
  const gamesQuery = useQuery({
    queryKey: ['sports-betting', 'all', { cluster }],
    queryFn: () => program.account.sportsBetting.all(),
  })

  const programAccount = useQuery({
    queryKey: ['sports-betting', 'program', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  /* -------------------- Mutation: initialize game ------------------ */
  const initializeGame = useMutation({
    mutationKey: ['sports-betting', 'initialize', { cluster }],
    mutationFn: async ({
      teamA,
      teamB,
      start,
      end,
    }: {
      teamA: string
      teamB: string
      start: number // unix secs
      end: number   // unix secs
    }) => {
      const [sportsBettingPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('sports_betting')],
        programId,
      )
      const [potPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('pot'), sportsBettingPda.toBuffer()],
        programId,
      )

      return program.methods
        .initializeConfig(teamA, teamB, new BN(start), new BN(end))
        .accounts({
          payer:           provider.wallet.publicKey,
          sports_betting:  sportsBettingPda,
          pot_account:     potPda,
          system_program:  SystemProgram.programId,
        })
        .rpc()
    },
    onSuccess: async (sig) => {
      txToast(sig)
      await gamesQuery.refetch()
    },
    onError: () => toast.error('Failed to create game'),
  })

  return { program, programId, gamesQuery, programAccount, initializeGame }
}

/* ================================================================== */
/*  Hook #2 – per-game actions (bet, end, claim)                      */
/* ================================================================== */
export function useSportsBettingGame({
  sportsBettingPda,
}: {
  sportsBettingPda: PublicKey
}) {
  const { cluster } = useCluster()
  const txToast = useTransactionToast()
  const { program } = useSportsBettingProgram()

  /* -------- derive pot PDA from the game PDA -------- */
  const [potPda] = useMemo(
    () =>
      PublicKey.findProgramAddressSync(
        [Buffer.from('pot'), sportsBettingPda.toBuffer()],
        program.programId,
      ),
    [sportsBettingPda, program.programId],
  )

  /* -------------------- Query: game ------------------ */
  const gameQuery = useQuery({
    queryKey: ['sports-betting', 'fetch', { cluster, sportsBettingPda }],
    queryFn: () => program.account.sportsBetting.fetch(sportsBettingPda),
  })

  /* -------------------- Mutation: placeBet ------------------ */
  const placeBet = useMutation({
    mutationKey: ['sports-betting', 'bet', { cluster, sportsBettingPda }],
    mutationFn: async ({
      lamports,
      team,
    }: {
      lamports: number
      team: 0 | 1
    }) =>
      program.methods
        .placeBet(new BN(lamports), team)
        .accounts({
          bettor:          program.provider.wallet.publicKey,
          sports_betting:  sportsBettingPda,
          pot_account:     potPda,
          system_program:  SystemProgram.programId,
        })
        .rpc(),
    onSuccess: async (sig) => {
      txToast(sig)
      await gameQuery.refetch()
    },
  })

  /* -------------------- Mutation: endGame ------------------- */
  const endGame = useMutation({
    mutationKey: ['sports-betting', 'end', { cluster, sportsBettingPda }],
    mutationFn: (winningTeam: 0 | 1) =>
      program.methods
        .endGame(winningTeam)
        .accounts({
          admin:           program.provider.wallet.publicKey,
          sports_betting:  sportsBettingPda,
        })
        .rpc(),
    onSuccess: async (sig) => {
      txToast(sig)
      await gameQuery.refetch()
    },
  })

  /* -------------------- Mutation: claimReward --------------- */
  const claimReward = useMutation({
    mutationKey: ['sports-betting', 'claim', { cluster, sportsBettingPda }],
    mutationFn: () =>
      program.methods
        .claimRewards()
        .accounts({
          bettor:          program.provider.wallet.publicKey,
          sports_betting:  sportsBettingPda,
          pot_account:     potPda,
          system_program:  SystemProgram.programId,
        })
        .rpc(),
    onSuccess: (sig) => txToast(sig),
  })

  return { gameQuery, placeBet, endGame, claimReward }
}
