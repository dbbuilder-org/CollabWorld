'use client'

import { useState, useEffect } from 'react'

interface CountdownTimerProps {
  targetDate: string
  label: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function getTimeLeft(targetDate: string): TimeLeft | null {
  const diff = new Date(targetDate).getTime() - Date.now()
  if (diff <= 0) return null

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  }
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

export default function CountdownTimer({ targetDate, label }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() =>
    getTimeLeft(targetDate)
  )

  useEffect(() => {
    const tick = () => setTimeLeft(getTimeLeft(targetDate))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [targetDate])

  if (!timeLeft) {
    return (
      <div className="text-sm font-semibold text-purple-400" role="timer">
        {label}
      </div>
    )
  }

  return (
    <div className="flex gap-3 items-center" role="timer">
      {[
        { value: timeLeft.days, unit: 'days' },
        { value: timeLeft.hours, unit: 'hrs' },
        { value: timeLeft.minutes, unit: 'min' },
        { value: timeLeft.seconds, unit: 'sec' },
      ].map(({ value, unit }) => (
        <div key={unit} className="flex flex-col items-center">
          <span className="text-2xl font-mono font-bold text-white">
            {pad(value)}
          </span>
          <span className="text-xs text-zinc-500 uppercase tracking-wide">{unit}</span>
        </div>
      ))}
    </div>
  )
}
