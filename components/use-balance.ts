/**
 * Copyright 2026 Circle Internet Group, Inc.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import { SWITCH_TARGET, balanceChainFor } from '@/lib/balance-chains'

/** `balanceOf(address)`. */
const BALANCE_OF = '0x70a08231'

const DECIMALS = 6

/**
 * How often the balance is re-read while the tab is visible. MetaMask's
 * injected provider does not offer a dependable `eth_subscribe`, so a poll is
 * what "live" means here — under a block time on the fast chains the widget
 * delivers to, and the deposit events refresh it out of band anyway.
 */
const POLL_MS = 6_000

function format(hex: string): string {
  const raw = BigInt(hex)
  const scale = BigInt(10) ** BigInt(DECIMALS)
  return `${raw / scale}.${(raw % scale).toString().padStart(DECIMALS, '0')}`
}

async function call(owner: string, usdc: string, block: string): Promise<string | null> {
  const result = await window.ethereum?.request({
    method: 'eth_call',
    params: [
      { to: usdc, data: BALANCE_OF + owner.slice(2).toLowerCase().padStart(64, '0') },
      block,
    ],
  })
  return typeof result === 'string' ? format(result) : null
}

/**
 * Read at the `pending` tag rather than `latest`, which is what makes the poll
 * a poll at all: MetaMask caches an `eth_call` against the block its tracker
 * last saw, and that tracker does not reliably advance while the extension
 * popup is closed — so every `latest` read after the first comes back from the
 * cache, and the figure only moves when a page load starts a fresh one. The
 * `pending` tag is never cached by that middleware.
 *
 * Nodes that reject it fall back to `latest`, which is no worse than the
 * behaviour before this hook existed.
 */
async function read(owner: string, usdc: string): Promise<string | null> {
  try {
    return await call(owner, usdc, 'pending')
  } catch {
    return await call(owner, usdc, 'latest')
  }
}

/**
 * USDC held by `address`, on whichever chain MetaMask currently has selected.
 *
 * Reading through the wallet's provider means there is no RPC endpoint to
 * configure and no chain pinned at build time: the figure follows the network
 * the user is looking at, which is the one they expect it to describe. The
 * trade is that only chains in the table can be read — `chain` comes back null
 * for anything else, and the screen says so rather than showing a zero that
 * would be indistinguishable from an empty wallet.
 */
export function useBalance(address: string | null) {
  const [chainId, setChainId] = useState<string | null>(null)
  // Tagged with what it was read for, so a reply that arrives after the user
  // has switched account or network is simply not the balance being asked for
  // any more, and is dropped when it is read back out below.
  const [last, setLast] = useState<{ owner: string; usdc: string; value: string } | null>(null)
  // Bumped to force a re-read outside the poll — after a deposit settles, say.
  const [nonce, setNonce] = useState(0)

  const refresh = useCallback(() => setNonce((n) => n + 1), [])

  // Which chain the wallet is on, kept current across manual switches. Rerun on
  // `address` because a wallet extension can inject `window.ethereum` after
  // this component mounts: connecting proves the provider has arrived, and
  // without a second look the chain would stay unknown for the whole session.
  useEffect(() => {
    const provider = window.ethereum
    if (!provider) return

    provider
      .request({ method: 'eth_chainId' })
      .then((id) => setChainId(typeof id === 'string' ? id.toLowerCase() : null))
      .catch(() => { })

    const onChainChanged = (...args: never[]) => {
      const id = args[0] as unknown as string
      setChainId(typeof id === 'string' ? id.toLowerCase() : null)
    }
    provider.on('chainChanged', onChainChanged)
    return () => provider.removeListener('chainChanged', onChainChanged)
  }, [address])

  const chain = chainId ? balanceChainFor(chainId) : null
  const usdc = chain?.usdc ?? null

  // One poll per address-and-chain pair, restarted whenever either moves or a
  // deposit asks for a fresh read.
  useEffect(() => {
    if (!address || !usdc) return

    const tick = async () => {
      if (document.hidden) return
      try {
        const value = await read(address, usdc)
        if (value !== null) setLast({ owner: address, usdc, value })
      } catch {
        // A dropped RPC call leaves the last good figure in place. The balance
        // is context, and nothing about buying depends on it.
      }
    }

    void tick()
    const id = setInterval(tick, POLL_MS)
    // A backgrounded tab stops polling, so it comes back stale.
    const onVisible = () => {
      if (!document.hidden) void tick()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [address, usdc, nonce])

  const current = last && last.owner === address && last.usdc === usdc ? last.value : null

  return {
    balance: current,
    /** Null while the chain is unknown, or when it is one this build can't read. */
    chain,
    /** True once a chain is known and it is not one the balance can be read from. */
    unsupported: chainId !== null && chain === null,
    /** The chain the switch button offers, named on the button itself. */
    switchTarget: SWITCH_TARGET,
    switchNetwork,
    refresh,
  }
}

/**
 * Ask MetaMask to move to the chain this build reads balances on. A rejection
 * needs no handling: the screen is already showing the state that asked for it.
 */
async function switchNetwork() {
  try {
    await window.ethereum?.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SWITCH_TARGET.chainId }],
    })
  } catch {
    // Testnets are hidden in MetaMask until the user turns them on, and an
    // unknown chain is refused outright. Nothing to do but leave the prompt up.
  }
}
