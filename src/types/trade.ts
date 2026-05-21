export type Direction = 'Long' | 'Short'
export type WinLoss = 'Win' | 'Loss' | 'Breakeven'

export interface Trade {
  id: string
  user_id: string
  trade_date: string
  symbol: string
  direction: Direction
  entry_price: number
  close_price: number
  points: number
  size: number
  value: number
  fee: number
  net: number
  win_loss: WinLoss
  reason_entry: string | null
  emotion_score: number | null
  rule_followed: boolean | null
  lesson_notes: string | null
  created_at: string
  updated_at: string
}

export type TradeInsert = Omit<
  Trade,
  'id' | 'user_id' | 'points' | 'net' | 'win_loss' | 'created_at' | 'updated_at'
>

export interface UserSettings {
  id: string
  user_id: string
  starting_capital: number
  currency: string
  created_at: string
  updated_at: string
}

export interface DailyStats {
  date: string
  total_trades: number
  wins: number
  losses: number
  net_pnl: number
}

export interface KPIStats {
  total_trades: number
  wins: number
  losses: number
  win_rate: number
  profit_factor: number
  total_net: number
  avg_win: number
  avg_loss: number
  avg_rr: number
  roi: number
  starting_capital: number
}
