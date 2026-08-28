'use client'

import { useEffect, useState } from 'react'
import { BatteryFullIcon, SignalIcon, WifiIcon } from './icons'

function useClock() {
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(`${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, '0')}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return time
}

export function StatusBar() {
  const time = useClock()

  return (
    <div className="hidden items-center justify-between px-8 pt-5 text-foreground md:flex">
      <span
        className="text-[17px] font-semibold tracking-tight tabular-nums"
        suppressHydrationWarning
      >
        {time ?? '9:41'}
      </span>
      <div className="flex items-center gap-1.5">
        <SignalIcon className="size-[18px] fill-current" strokeWidth={1.5} />
        <WifiIcon className="size-[18px]" strokeWidth={2.5} />
        <BatteryFullIcon className="size-6 fill-current" strokeWidth={1.5} />
      </div>
    </div>
  )
}
