'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ONRAMP_EVENT_TYPES,
  createOnrampKit,
  fetchOnrampSession,
  type OnrampEventEnvelope,
} from '@crcl-main/onramp-kit'
import { BottomNav, tabs, type TabId } from './bottom-nav'
import { HomeScreen } from './home-screen'
import { OnrampSheet } from './onramp-sheet'
import { StatusBar } from './status-bar'
import { useActivity } from './use-activity'
import { WalletScreen } from './wallet-screen'

type OnrampSession = Awaited<ReturnType<typeof fetchOnrampSession>>

const SESSION_URL = '/api/onramp/session'

// The widget renders inside the phone unless NEXT_PUBLIC_EMBEDDED_ONRAMP is set
// to 0 or false, which opens it in a popup instead. It has to be read as this
// exact expression: Next inlines it at build time, so destructuring or dynamic
// lookup won't work, and `next dev` only picks up a change on restart.
const EMBEDDED = !['0', 'false'].includes(
  (process.env.NEXT_PUBLIC_EMBEDDED_ONRAMP ?? '').trim().toLowerCase()
)

// USDC only, and only on chains a MetaMask address can actually receive on.
// `assets` fields combine with AND semantics, so this is "USDC on these chains".
// This is display-scoping only. Circle's catalog stays the source of truth.
const ASSETS = {
  tokens: ['USDC'],
  chains: [
    'arc',
    'ethereum',
    'base',
    'arbitrum',
    'polygon',
    'linea',
    'avalanche',
    'unichain',
    'celo',
    'hyperevm',
    'ronin',
  ],
}

// The widget letterboxes its content against `--onramp-surround`, which its
// launch URL exposes as a `bgcolor` hex. It defaults to the same navy this app
// now uses, so this only matters if either side's surface colour moves — but
// pinning it means the seam can't reappear.
const SURROUND = '#0d1b2f'

function tintSurround(session: OnrampSession): OnrampSession {
  // Bare-token sessions have no URL to rewrite; the kit composes one itself.
  if (typeof session.widgetUrl !== 'string') return session
  const url = new URL(session.widgetUrl)
  url.searchParams.set('bgcolor', SURROUND)
  return { ...session, widgetUrl: url.toString() }
}

const order = tabs.map((tab) => tab.id)

export function PhoneApp() {
  const [tab, setTab] = useState<TabId>('home')
  const [enter, setEnter] = useState('animate-screen-in')

  const [address, setAddress] = useState<string | null>(null)
  const [session, setSession] = useState<OnrampSession | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const changeTab = (next: TabId) => {
    if (next === tab) return
    setEnter(
      order.indexOf(next) > order.indexOf(tab)
        ? 'animate-screen-in-right'
        : 'animate-screen-in-left',
    )
    setTab(next)
  }

  const kitRef = useRef<ReturnType<typeof createOnrampKit> | null>(null)
  // Lazily constructed so nothing touches `window` during SSR. The getter is
  // synchronous, which openWindow requires.
  const getKit = () => (kitRef.current ??= createOnrampKit({
    widgetBaseUrl: process.env.NEXT_PUBLIC_ONRAMP_WIDGET_BASE_URL,
  }))

  // Sessions are single-use and openWindow must run synchronously inside the
  // click handler, so one is always minted ahead of time.
  const mintSession = useCallback(async (destinationAddress: string) => {
    setSession(null)
    try {
      const fresh = await fetchOnrampSession({
        url: SESSION_URL,
        body: {
          userId: destinationAddress,
          destinationAddress,
          assets: ASSETS,
        },
      })
      setSession(fresh)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create a session.')
    }
  }, [])

  // Mainnet USDC balance, shown purely as context. A failure here is silent:
  // the balance is decoration, and nothing about buying depends on it. The ref
  // drops responses for an address the user has already switched away from.
  const balanceForRef = useRef<string | null>(null)
  const loadBalance = useCallback(async (owner: string) => {
    try {
      const res = await fetch(`/api/balance?address=${owner}`)
      if (!res.ok) return
      const { balance: next } = (await res.json()) as { balance: string }
      if (balanceForRef.current === owner) setBalance(next)
    } catch {
      // Leave the balance at zero rather than showing a broken figure.
    }
  }, [])

  // The single place an address enters the app, so minting stays an event
  // reaction rather than something an effect has to chase.
  const adoptAddress = useCallback(
    (next: string | null) => {
      setAddress(next)
      setBalance(null)
      balanceForRef.current = next
      if (next) {
        void mintSession(next)
        void loadBalance(next)
      } else {
        setSession(null)
        setSheetOpen(false)
      }
    },
    [mintSession, loadBalance],
  )

  // Restore an already-connected MetaMask account without prompting, and stay
  // subscribed to account switches.
  useEffect(() => {
    const provider = window.ethereum
    if (!provider) return

    provider
      .request({ method: 'eth_accounts' })
      .then((accounts) => adoptAddress((accounts as string[])[0] ?? null))
      .catch(() => { })

    const onAccountsChanged = (...args: never[]) => {
      const accounts = args[0] as unknown as string[]
      adoptAddress(accounts[0] ?? null)
    }
    provider.on('accountsChanged', onAccountsChanged)
    return () => provider.removeListener('accountsChanged', onAccountsChanged)
  }, [adoptAddress])

  const connect = useCallback(async () => {
    setError(null)
    const provider = window.ethereum
    if (!provider?.isMetaMask) {
      setError('MetaMask not detected. Install it and reload the page.')
      return
    }
    try {
      const accounts = (await provider.request({
        method: 'eth_requestAccounts',
      })) as string[]
      adoptAddress(accounts[0] ?? null)
    } catch {
      setError('Wallet connection was rejected.')
    }
  }, [adoptAddress])

  // Clearing site data doesn't disconnect anything: the eth_accounts grant
  // lives in MetaMask, keyed by origin, so it has to be revoked there.
  const disconnect = useCallback(async () => {
    setError(null)
    try {
      await window.ethereum?.request({
        method: 'wallet_revokePermissions',
        params: [{ eth_accounts: {} }],
      })
    } catch {
      // Wallets that don't implement wallet_revokePermissions will reconnect
      // silently on reload. Dropping local state is all we can do for them.
    }
    adoptAddress(null)
  }, [adoptAddress])

  const { entries: activity, record } = useActivity(address)

  // Every widget event, from either transport. Deposits become activity rows;
  // a finished deposit also dates the balance, so it is re-read here.
  const handleEvent = useCallback(
    (envelope: OnrampEventEnvelope) => {
      console.log('onramp', envelope.event, envelope.payload)

      if (
        envelope.event !== ONRAMP_EVENT_TYPES.DEPOSIT_SUBMITTED &&
        envelope.event !== ONRAMP_EVENT_TYPES.DEPOSIT_SETTLED
      ) {
        return
      }

      record(envelope)

      const done =
        envelope.event === ONRAMP_EVENT_TYPES.DEPOSIT_SETTLED ||
        envelope.payload.settlementExpected === false
      if (done && address) void loadBalance(address)
    },
    [record, loadBalance, address],
  )

  // Embedded mode. The widget lives in a sheet over the phone screen, so it
  // goes up with the sheet and comes down with it. Nothing re-mints here: the
  // mount consumes the session, and minting on every mount would feed the
  // effect its own next session forever.
  const containerRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const container = containerRef.current
    if (!sheetOpen || !session || !address || !container) return

    const widget = getKit().mountIframe({
      session: tintSurround(session),
      container,
      onAnyEvent: handleEvent,
      // Covers an expiry mid-flow and a token the widget rejects outright.
      onSessionExpired: () => mintSession(address),
    })
    return () => widget.close()
  }, [sheetOpen, session, address, mintSession, handleEvent])

  // Closing consumes nothing further, but the mount already spent the session,
  // so the next purchase needs a fresh one.
  const closeSheet = () => {
    setSheetOpen(false)
    if (!address) return
    void mintSession(address)
    // A deposit can settle in the seconds around the close, which produces no
    // event once the iframe is gone. Re-reading here catches that case.
    void loadBalance(address)
  }

  function addMoney() {
    if (!address) {
      changeTab('wallet')
      return
    }
    if (!session) return
    setError(null)

    if (EMBEDDED) {
      setSheetOpen(true)
      return
    }

    const result = getKit().openWindow({ session })

    if (result.status === 'blocked') {
      setError(
        result.reason === 'popup_blocked'
          ? 'Your browser blocked the popup. Allow popups for this site and try again.'
          : `Popup unavailable (${result.reason}). ${result.errorMessage ?? ''}`,
      )
    } else {
      result.widget.on('*', handleEvent)
    }

    // The session just got consumed either way, so mint the next one.
    mintSession(address)
  }

  return (
    <div className="relative flex h-full flex-col bg-background">
      <StatusBar />
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div key={tab} className={`flex min-h-0 flex-1 flex-col ${enter}`}>
          {tab === 'home' ? (
            <HomeScreen
              balance={Number(balance ?? 0)}
              activity={activity}
              onAddMoney={addMoney}
              addMoneyHint={address && !session ? 'Preparing session…' : null}
            />
          ) : (
            <WalletScreen address={address} onConnect={connect} onDisconnect={disconnect} />
          )}
        </div>
        <BottomNav active={tab} onChange={changeTab} />
        {sheetOpen && (
          <OnrampSheet containerRef={containerRef} ready={Boolean(session)} onClose={closeSheet} />
        )}
        {error && (
          <button
            type="button"
            onClick={() => setError(null)}
            className="absolute inset-x-5 bottom-[104px] z-30 rounded-lg bg-destructive px-4 py-3 text-left text-sm font-medium text-foreground shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
          >
            {error}
          </button>
        )}
      </div>
    </div>
  )
}
