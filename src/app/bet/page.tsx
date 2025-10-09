import BetInfo from '../../components/bet/BetInfo'

export default function Bet() {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-center min-h-screen py-2">
         <BetInfo/>
         <BetInfo/>
         <BetInfo/>
      </div>
    </div>
  )
}