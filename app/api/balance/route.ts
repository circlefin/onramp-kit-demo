import { NextResponse } from 'next/server'

// USDC on Ethereum mainnet, 6 decimals. The wallet may be sitting on any
// chain, so the balance is read from mainnet directly rather than through the
// injected provider.
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const DECIMALS = 6
const BALANCE_OF = '0x70a08231'

// Public endpoint, no key required. Set ETH_RPC_URL to point at your own node.
const RPC_URL = process.env.ETH_RPC_URL ?? 'https://ethereum-rpc.publicnode.com'

export async function GET(request: Request) {
  const address = new URL(request.url).searchParams.get('address')
  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return NextResponse.json({ error: 'Invalid address.' }, { status: 400 })
  }

  const rpc = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_call',
      params: [
        {
          to: USDC,
          data: BALANCE_OF + address.slice(2).toLowerCase().padStart(64, '0'),
        },
        'latest',
      ],
    }),
    cache: 'no-store',
  })

  if (!rpc.ok) {
    return NextResponse.json({ error: 'RPC request failed.' }, { status: 502 })
  }

  const body = (await rpc.json()) as { result?: string; error?: unknown }
  if (typeof body.result !== 'string') {
    return NextResponse.json({ error: 'RPC request failed.' }, { status: 502 })
  }

  const raw = BigInt(body.result)
  const scale = BigInt(10) ** BigInt(DECIMALS)
  const balance = `${raw / scale}.${(raw % scale).toString().padStart(DECIMALS, '0')}`

  return NextResponse.json({ balance })
}
