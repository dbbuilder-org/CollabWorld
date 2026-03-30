/**
 * Structured logger for Next.js API routes.
 * In production: emits JSON lines to stdout (captured by Render log aggregation).
 * In development: emits readable formatted output.
 */

type LogLevel = 'info' | 'warn' | 'error'

function serialize(args: unknown[]): string {
  return args
    .map((a) => {
      if (a instanceof Error) return `${a.message}${a.stack ? `\n${a.stack}` : ''}`
      if (typeof a === 'string') return a
      try { return JSON.stringify(a) } catch { return String(a) }
    })
    .join(' ')
}

function emit(level: LogLevel, ...args: unknown[]) {
  const msg = serialize(args)
  if (process.env.NODE_ENV === 'production') {
    const line = JSON.stringify({ level, message: msg, timestamp: new Date().toISOString() })
    if (level === 'error') process.stderr.write(line + '\n')
    else process.stdout.write(line + '\n')
  } else {
    const prefix = level === 'error' ? '\x1b[31m[error]\x1b[0m' : level === 'warn' ? '\x1b[33m[warn]\x1b[0m' : '\x1b[36m[info]\x1b[0m'
    if (level === 'error') console.error(prefix, msg)
    else if (level === 'warn') console.warn(prefix, msg)
    else console.log(prefix, msg)
  }
}

export const logger = {
  info: (...args: unknown[]) => emit('info', ...args),
  warn: (...args: unknown[]) => emit('warn', ...args),
  error: (...args: unknown[]) => emit('error', ...args),
}
