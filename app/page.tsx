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

import { DeviceFrame } from '@/components/device-frame'
import { PhoneApp } from '@/components/phone-app'
import { ENVIRONMENT } from '@/lib/server-environment'

export default function Home() {
  return (
    <main className="relative mx-auto flex min-h-0 w-full flex-1 flex-col items-center justify-center md:max-w-7xl md:p-6">
      <DeviceFrame className="flex-1 md:flex-none">
        {/* Resolved on the server so the phone shows the environment the
            sessions are actually minted in. */}
        <PhoneApp environment={ENVIRONMENT} />
      </DeviceFrame>
    </main>
  )
}
