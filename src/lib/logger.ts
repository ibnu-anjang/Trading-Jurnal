/**
 * Thin logger wrapper for consistent log format.
 * Designed for Vercel Runtime Logs — prefixes are searchable in the dashboard.
 *
 * Usage:
 *   import { logger } from '@/lib/logger'
 *   logger.error('useTrades.fetch', error, { accountId })
 *   logger.warn('csv.export', 'no trades')
 *   logger.info('auth.login', 'user signed in', { userId })
 */

type LogContext = Record<string, unknown> | undefined

function fmt(level: string, scope: string, message: unknown, context?: LogContext) {
  const ts = new Date().toISOString()
  const ctx = context ? ` ${JSON.stringify(context)}` : ''
  const msg = message instanceof Error
    ? `${message.name}: ${message.message}${message.stack ? `\n${message.stack}` : ''}`
    : typeof message === 'string'
      ? message
      : JSON.stringify(message)
  return `[${ts}] [${level}] [${scope}] ${msg}${ctx}`
}

export const logger = {
  error(scope: string, error: unknown, context?: LogContext) {
    console.error(fmt('ERROR', scope, error, context))
  },
  warn(scope: string, message: unknown, context?: LogContext) {
    console.warn(fmt('WARN', scope, message, context))
  },
  info(scope: string, message: unknown, context?: LogContext) {
    console.log(fmt('INFO', scope, message, context))
  },
}
