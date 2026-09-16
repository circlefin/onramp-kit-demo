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

/**
 * The chains the home-screen balance can be read from, and the USDC contract on
 * each.
 *
 * The balance is read through MetaMask's own provider, on whatever chain the
 * wallet has selected, so the RPC endpoint and the chain name are both
 * discovered at runtime. The token contract is the one thing that cannot be —
 * hence this table, and hence a wallet on a chain missing from it gets an empty
 * state rather than a figure.
 *
 * Split by environment for the same reason the rest of the app is: on sandbox
 * only testnets resolve, so a sandbox run can never display a mainnet balance
 * under a sandbox purchase, and on production only mainnets do.
 *
 * Keyed by the hex chain id `eth_chainId` reports, lowercased. Addresses are
 * Circle's published USDC deployments:
 * https://developers.circle.com/stablecoins/usdc-contract-addresses
 *
 * Safe to import from client components.
 */

import { CLIENT_ENVIRONMENT, type OnrampEnvironment } from './onramp-environment'

export type BalanceChain = {
  /** Shown next to the balance, so the figure is never ambiguous. */
  label: string
  /** USDC token contract on that chain. */
  usdc: string
}

// Ronin is missing from both tables on purpose: the widget can deliver there,
// but Circle publishes no USDC address for it, and a guessed contract is worse
// than the empty state. Arc appears on sandbox only — Arc Testnet exposes USDC
// as an ERC-20 at the address below even though it is also the native gas
// token, so `balanceOf` reads it like any other chain.
const CHAINS: Record<OnrampEnvironment, Record<string, BalanceChain>> = {
  production: {
    '0x1': { label: 'Ethereum', usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
    '0x2105': { label: 'Base', usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
    '0xa4b1': { label: 'Arbitrum', usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' },
    '0x89': { label: 'Polygon', usdc: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359' },
    '0xe708': { label: 'Linea', usdc: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff' },
    '0xa86a': { label: 'Avalanche', usdc: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E' },
    '0x82': { label: 'Unichain', usdc: '0x078D782b760474a361dDA0AF3839290b0EF57AD6' },
    '0xa4ec': { label: 'Celo', usdc: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C' },
    '0x3e7': { label: 'HyperEVM', usdc: '0xb88339CB7199b77E23DB6E890353E22632Ba630f' },
  },
  sandbox: {
    '0xaa36a7': { label: 'Ethereum Sepolia', usdc: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' },
    '0x14a34': { label: 'Base Sepolia', usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' },
    '0x66eee': { label: 'Arbitrum Sepolia', usdc: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d' },
    '0x13882': { label: 'Polygon Amoy', usdc: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582' },
    '0xe705': { label: 'Linea Sepolia', usdc: '0xFEce4462D57bD51A6A552365A011b95f0E16d9B7' },
    '0xa869': { label: 'Avalanche Fuji', usdc: '0x5425890298aed601595a70AB815c96711a31Bc65' },
    '0x515': { label: 'Unichain Sepolia', usdc: '0x31d0220469e10c4E71834a79b1f276d740d3768F' },
    '0xaa044c': { label: 'Celo Sepolia', usdc: '0x01C5C0122039549AD1493B8220cABEdD739BC44E' },
    '0x3e6': { label: 'HyperEVM Testnet', usdc: '0x2B3370eE501B4a559b57D449569354196457D8Ab' },
    '0x4cef52': { label: 'Arc Testnet', usdc: '0x3600000000000000000000000000000000000000' },
  },
}

/** The table for the environment this build talks to. */
export const BALANCE_CHAINS = CHAINS[CLIENT_ENVIRONMENT]

/**
 * Where the "switch network" button sends a wallet that is on a chain this
 * build cannot read. Ethereum and Ethereum Sepolia are both chains MetaMask
 * ships with, so switching needs no `wallet_addEthereumChain` fallback.
 */
export const SWITCH_TARGET: { chainId: string } & BalanceChain =
  CLIENT_ENVIRONMENT === 'production'
    ? { chainId: '0x1', ...CHAINS.production['0x1'] }
    : { chainId: '0xaa36a7', ...CHAINS.sandbox['0xaa36a7'] }

/** `null` for a chain the balance cannot be read from. */
export function balanceChainFor(chainId: string): BalanceChain | null {
  return BALANCE_CHAINS[chainId.toLowerCase()] ?? null
}
