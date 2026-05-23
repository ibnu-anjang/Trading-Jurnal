export interface TradingAccount {
  id: string
  user_id: string
  name: string
  broker: string | null
  currency: string
  initial_balance: number
  is_archived: boolean
  created_at: string
  updated_at: string
}

export type TradingAccountInsert = Omit<
  TradingAccount,
  'id' | 'user_id' | 'is_archived' | 'created_at' | 'updated_at'
>

export type TradingAccountUpdate = Partial<TradingAccountInsert> & {
  is_archived?: boolean
}
