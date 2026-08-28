'use client'

import { useEffect, useState } from 'react'
import { CopyIcon, WalletIcon } from './icons'

const BUTTON =
  'inline-flex h-14 w-full shrink-0 items-center justify-center gap-1.5 rounded-lg border border-transparent bg-clip-padding bg-secondary px-4 text-base font-semibold whitespace-nowrap text-secondary-foreground transition-all outline-none select-none hover:bg-[color-mix(in_oklch,var(--color-secondary),var(--color-foreground)_5%)] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 active:translate-y-px'

export function WalletScreen({
  address,
  onConnect,
  onDisconnect,
}: {
  address: string | null
  onConnect: () => void
  onDisconnect: () => void
}) {
  // Timestamped rather than boolean, so a second click while the tooltip is
  // still up restarts the timer instead of doing nothing.
  const [copiedAt, setCopiedAt] = useState(0)

  useEffect(() => {
    if (!copiedAt) return
    const id = setTimeout(() => setCopiedAt(0), 1500)
    return () => clearTimeout(id)
  }, [copiedAt])

  const copy = async () => {
    if (!address) return
    try {
      await navigator.clipboard.writeText(address)
      setCopiedAt(Date.now())
    } catch {
      // Clipboard access can be denied outright. Nothing to say about it.
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-28 [scrollbar-width:none]">
      <div className="pt-10 md:pt-6">
        <h1 className="font-display text-[30px] leading-[1.2] font-light tracking-[-0.01em]">Wallet</h1>
        <p className="mt-2 text-base text-muted-foreground">
          {address
            ? 'USDC you buy is delivered to this address.'
            : 'Connect a wallet to continue purchasing stablecoins.'}
        </p>
      </div>

      {address ? (
        <div className="mt-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-secondary py-3.5 pr-2.5 pl-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium tracking-tight text-muted-foreground">Address</p>
              <p className="mt-1 truncate font-mono text-sm text-secondary-foreground">{address}</p>
            </div>
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={copy}
                aria-label="Copy address"
                className="flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-[color-mix(in_oklch,var(--color-secondary),var(--color-foreground)_5%)] hover:text-secondary-foreground"
              >
                <CopyIcon className="size-[18px]" />
              </button>
              {copiedAt > 0 && (
                <span
                  role="status"
                  className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 rounded-md bg-card px-3 py-1.5 text-xs whitespace-nowrap text-foreground ring-1 ring-border"
                >
                  Copied
                </span>
              )}
            </div>
          </div>
          <button type="button" onClick={onDisconnect} className={BUTTON}>
            Disconnect
          </button>
        </div>
      ) : (
        <button type="button" onClick={onConnect} className={`mt-6 ${BUTTON}`}>
          <WalletIcon className="size-[18px]" strokeWidth={2} />
          Connect MetaMask
        </button>
      )}
    </div>
  )
}
