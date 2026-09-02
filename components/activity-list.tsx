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

import { PlusIcon } from './icons'
import type { ActivityEntry } from './use-activity'

/** Widget labels are PascalCase identifiers; these are the human versions. */
const PAYMENT_METHODS: Record<string, string> = {
  ApplePay: 'Apple Pay',
  BankTransfer: 'Bank transfer',
  Debit: 'Debit card',
  GooglePay: 'Google Pay',
}

const when = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

const money = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function ActivityList({ entries }: { entries: ActivityEntry[] }) {
  if (entries.length === 0) {
    return <p className="mt-6 text-sm text-muted-foreground">No activity yet</p>
  }

  return (
    <ul className="mt-2 flex flex-col">
      {entries.map((entry) => {
        const method = entry.paymentMethod
          ? (PAYMENT_METHODS[entry.paymentMethod] ?? entry.paymentMethod)
          : null

        return (
          <li key={entry.id} className="flex items-center gap-3 py-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
              <PlusIcon className="size-5 text-primary" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium tracking-tight">
                Added {entry.tokenSymbol ?? 'money'}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {[method, when.format(entry.at)].filter(Boolean).join(' · ')}
              </p>
            </div>
            <div className="shrink-0 text-right">
              {entry.amount !== undefined && (
                <p className="text-sm font-medium tracking-tight tabular-nums">
                  +${money.format(entry.amount)}
                </p>
              )}
              {entry.status === 'pending' && (
                <p className="mt-0.5 text-xs text-muted-foreground">Pending</p>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
