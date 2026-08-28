import { DeviceFrame } from '@/components/device-frame'
import { PhoneApp } from '@/components/phone-app'

export default function Home() {
  return (
    <main className="relative mx-auto flex min-h-0 w-full flex-1 flex-col items-center justify-center md:max-w-7xl md:p-6">
      <DeviceFrame className="flex-1 md:flex-none">
        <PhoneApp />
      </DeviceFrame>
    </main>
  )
}
