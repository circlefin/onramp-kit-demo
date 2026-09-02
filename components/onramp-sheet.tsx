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

import type { RefObject } from 'react'
import { XIcon } from './icons'

export function OnrampSheet({
  containerRef,
  ready,
  onClose,
}: {
  /** The onramp iframe is mounted into this element by the kit. */
  containerRef: RefObject<HTMLDivElement | null>
  ready: boolean
  onClose: () => void
}) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-background animate-screen-in">
      <div className="flex items-center gap-4 px-5 py-4">
        <h2 className="flex-1 text-xl leading-tight font-normal tracking-tight">Add money</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex size-9 items-center justify-center rounded-full bg-muted text-foreground/70"
        >
          <XIcon className="size-5" />
        </button>
      </div>
      <div className="relative min-h-0 flex-1">
        {/* A cross-origin iframe can't size itself; the kit sets it to 100%, so
            the height has to come from this container. */}
        <div ref={containerRef} className="h-full w-full overflow-hidden" />
        {!ready && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            Preparing session…
          </p>
        )}
      </div>
    </div>
  )
}
