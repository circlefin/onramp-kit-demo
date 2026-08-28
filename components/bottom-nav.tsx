import { HouseIcon, WalletIcon } from './icons'

export const tabs = [
  { id: 'home', icon: HouseIcon, label: 'Home' },
  { id: 'wallet', icon: WalletIcon, label: 'Wallet' },
] as const

export type TabId = (typeof tabs)[number]['id']

export function BottomNav({
  active,
  onChange,
}: {
  active: TabId
  onChange: (tab: TabId) => void
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center px-5 pt-3 pb-6">
      <div className="flex items-center gap-2 rounded-full bg-card/80 px-2 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.35)] ring-1 ring-border backdrop-blur-lg">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex w-[100px] flex-col items-center gap-0.5 rounded-[40px] py-2 transition-colors duration-200 ${
              active === id ? 'bg-muted' : 'text-muted-foreground/50'
            }`}
          >
            <Icon className="size-6" />
            <span className="text-xs font-medium tracking-tight">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
