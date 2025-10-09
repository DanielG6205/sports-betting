'use client'

import { Keypair, PublicKey } from '@solana/web3.js'
import { useMemo } from 'react'
import { ellipsify } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

export default function BetInfo() {
  const teams = ['Team A', 'Team B']

  return (
    <div className="space-y-6 mt-6 ml-4 mr-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Game Information</CardTitle>
          <CardDescription className="text-center">
            Choose your favorite team and place your bet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-center gap-6">
            {teams.map((team) => (
              <div
                key={team}
                className="bg-white text-black px-8 py-6 rounded-2xl shadow-lg text-center font-semibold text-xl hover:scale-105 transition-transform cursor-pointer"
              >
                {team}
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              Place Bet
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}