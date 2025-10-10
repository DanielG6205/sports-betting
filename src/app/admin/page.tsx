'use client'

import { useState } from 'react'
import dayjs from 'dayjs'
import { useWallet } from '@solana/wallet-adapter-react'
import {
  useSportsBettingProgram,
  useSportsBettingGame,
} from '@/components/bet/BetDataAccess'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminPage() {
  /* form state */
  const [teamA, setTeamA] = useState('')
  const [teamB, setTeamB] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  /* hooks */
  const { publicKey } = useWallet()
  const { gamesQuery, initializeGame } = useSportsBettingProgram()

  const handleCreate = () => {
    if (!publicKey) return
    initializeGame.mutate({
      teamA,
      teamB,
      start: dayjs(start).unix(),
      end: dayjs(end).unix(),
    })
  }

  return (
    <div className="flex flex-col items-center min-h-screen gap-10 py-8">
      <h1 className="text-4xl font-bold">Sports-Bet Admin</h1>

      {/* ---------- new-game form ---------- */}
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Create new game</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            placeholder="Team A name"
            className="input input-bordered w-full"
            value={teamA}
            onChange={(e) => setTeamA(e.target.value)}
          />
          <input
            placeholder="Team B name"
            className="input input-bordered w-full"
            value={teamB}
            onChange={(e) => setTeamB(e.target.value)}
          />
          <input
            type="datetime-local"
            className="input input-bordered w-full"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
          <input
            type="datetime-local"
            className="input input-bordered w-full"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />

          <Button
            className="w-full"
            disabled={initializeGame.isPending}
            onClick={handleCreate}
          >
            {initializeGame.isPending ? 'Creating…' : 'Create game'}
          </Button>
        </CardContent>
      </Card>

      {/* ---------- list games ---------- */}
      <div className="w-full max-w-3xl space-y-4">
        {gamesQuery.data?.map(({ publicKey: pda, account }) => (
          <GameRow key={pda.toBase58()} pda={pda} data={account} />
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────── */
function GameRow({
  pda,
  data,
}: {
  pda: import('@solana/web3.js').PublicKey
  data: any
}) {
  const { endGame, gameQuery } = useSportsBettingGame({ sportsBettingPda: pda })
  const game = gameQuery.data ?? data

  const endAs = (winner: 0 | 1) => endGame.mutate(winner)

  return (
    <Card>
      <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4">
        <div>
          <p className="font-medium">
            {game.teamAName} vs {game.teamBName}
          </p>
          <p className="text-sm opacity-70">
            Pot: {Number(game.pot) / 1_000_000_000} ◎
          </p>
        </div>

        {game.status === 0 && (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => endAs(0)}>
              End as {game.teamAName}
            </Button>
            <Button variant="destructive" size="sm" onClick={() => endAs(1)}>
              End as {game.teamBName}
            </Button>
          </div>
        )}

        {game.status === 2 && (
          <p className="text-sm font-semibold text-green-600">
            Winner:{' '}
            {game.winningTeam === 0 ? game.teamAName : game.teamBName}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
