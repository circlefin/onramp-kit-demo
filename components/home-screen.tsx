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

import Image from 'next/image'
import { ActivityList } from './activity-list'
import { ArrowDownIcon, ArrowUpRightIcon, PlusIcon } from './icons'
import type { ActivityEntry } from './use-activity'

function formatBalance(balance: number) {
  const [whole, cents] = balance.toFixed(2).split('.')
  return [Number(whole).toLocaleString('en-US'), cents]
}

export function HomeScreen({
  balance = 0,
  balanceChain,
  prompt,
  activity = [],
  onAddMoney,
  addMoneyHint,
}: {
  balance?: number
  /**
   * Chain the balance was read from — the wallet's own selected network. Named
   * on screen because the widget can deliver to any of the chains it is scoped
   * to, and only the selected one is counted.
   */
  balanceChain?: string | null
  /**
   * Set instead of `balanceChain` whenever there is no figure to show — no
   * wallet connected, or a chain with no USDC contract to read. The balance is
   * withheld rather than shown as zero, which would be indistinguishable from
   * an empty wallet, and `action` is the one thing to do about it.
   */
  prompt?: { note: string; action: string; onAction: () => void } | null
  activity?: ActivityEntry[]
  onAddMoney: () => void
  /** Set while "Add money" is inert, and shown as its tooltip. */
  addMoneyHint?: string | null
}) {
  const [whole, cents] = formatBalance(balance)

  // Send and Withdraw are here for the shape of the screen only. Buying is the
  // one flow this sample implements.
  // `hintAlign` centres the tooltip on its button by default. The first action
  // sits at the screen's left padding and its hints are sentences rather than
  // two words, so centring one would hang it half off the phone — that one
  // grows rightwards from the button's left edge instead.
  const actions = [
    {
      icon: PlusIcon,
      label: 'Add money',
      primary: true,
      hint: addMoneyHint,
      hintAlign: 'left',
      onClick: onAddMoney,
    },
    {
      icon: ArrowUpRightIcon,
      label: 'Send',
      primary: false,
      hint: 'Coming soon',
      hintAlign: 'center',
    },
    {
      icon: ArrowDownIcon,
      label: 'Withdraw',
      primary: false,
      hint: 'Coming soon',
      hintAlign: 'center',
    },
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto [scrollbar-width:none]">
      <div className="flex items-center gap-4 px-5 pt-6 md:pt-2">
        <h1 className="flex-1 font-display text-[30px] leading-[1.2] font-light tracking-[-0.01em]">Home</h1>
        <div className="flex items-center gap-1.5 rounded-full bg-muted py-[4.5px] pr-3 pl-1.5">
          <Image
            src="/icons/tokens/usdc.svg"
            alt=""
            width={28}
            height={28}
            className="rounded-full"
          />
          <span className="text-[14.68px] font-semibold tracking-[-0.15px] text-foreground/80">
            USDC
          </span>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-6 px-5">
        <div className="flex flex-col gap-1.5 pt-2">
          <p className="text-base leading-normal tracking-tight text-muted-foreground">
            Current Balance
            {prompt ? (
              <span className="opacity-60"> · {prompt.note}</span>
            ) : (
              balanceChain && <span className="opacity-60"> · {balanceChain}</span>
            )}
          </p>
          {/* Dashes keep the figure's shape, so the screen doesn't reflow when
              the wallet moves on or off a readable chain. */}
          <div
            className={`flex items-baseline gap-0.5 font-display tabular-nums ${prompt ? 'opacity-30' : ''}`}
          >
            <span className="text-[34px] leading-none font-light tracking-tight opacity-50">$</span>
            <span className="text-[54px] leading-none font-light tracking-tight">
              {prompt ? '—' : whole}.
            </span>
            <span className="text-[34px] leading-none font-light tracking-tight">
              {prompt ? '——' : cents}
            </span>
          </div>
          {prompt && (
            <button
              type="button"
              onClick={prompt.onAction}
              className="mt-1.5 flex w-fit items-center gap-1.5 rounded-full bg-muted py-2 pr-4 pl-3.5 text-sm font-medium tracking-tight text-foreground/80 transition-colors hover:bg-[color-mix(in_oklch,var(--color-muted),var(--color-foreground)_5%)] active:translate-y-px"
            >
              <span className="size-1.5 rounded-full bg-primary" />
              {prompt.action}
            </button>
          )}
        </div>

        <div className="flex items-start gap-2">
          {actions.map(({ icon: Icon, label, primary, hint, hintAlign, onClick }) => (
            <div key={label} className="group relative">
              <button
                type="button"
                onClick={hint ? undefined : onClick}
                aria-disabled={hint ? true : undefined}
                className="flex w-[72px] flex-col items-center gap-1 aria-disabled:cursor-not-allowed"
              >
                <div
                  className={`flex size-12 items-center justify-center rounded-full ${primary ? 'bg-primary' : 'bg-muted'} ${
                    // Only the primary action dims when it is inert. Send and
                    // Withdraw carry a hint permanently, and dimming those two
                    // for good would read as a broken screen rather than a
                    // disabled button.
                    primary && hint ? 'opacity-40' : ''
                  }`}
                >
                  <Icon
                    className={`size-7 ${primary ? 'text-primary-foreground' : 'text-primary'}`}
                    strokeWidth={1.5}
                  />
                </div>
                <span className="text-sm font-medium tracking-tight whitespace-nowrap text-muted-foreground">
                  {label}
                </span>
              </button>
              {hint && (
                <span
                  role="tooltip"
                  className={`pointer-events-none absolute bottom-full mb-1 hidden rounded-md bg-card px-3 py-1.5 text-xs whitespace-nowrap text-foreground ring-1 ring-border group-hover:block ${
                    hintAlign === 'left' ? 'left-0' : 'left-1/2 -translate-x-1/2'
                  }`}
                >
                  {hint}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 mb-8 h-3 shrink-0 bg-secondary" />

      <div className="px-5 pb-28">
        <div className="flex items-center justify-between">
          <h2 className="text-xl leading-tight font-normal tracking-tight">Activity</h2>
        </div>
        <ActivityList entries={activity} />
      </div>
    </div>
  )
}
