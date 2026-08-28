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
  activity = [],
  onAddMoney,
  addMoneyHint,
}: {
  balance?: number
  activity?: ActivityEntry[]
  onAddMoney: () => void
  /** Set while "Add money" is inert, and shown as its tooltip. */
  addMoneyHint?: string | null
}) {
  const [whole, cents] = formatBalance(balance)

  // Send and Withdraw are here for the shape of the screen only. Buying is the
  // one flow this sample implements.
  const actions = [
    {
      icon: PlusIcon,
      label: 'Add money',
      primary: true,
      hint: addMoneyHint,
      onClick: onAddMoney,
    },
    { icon: ArrowUpRightIcon, label: 'Send', primary: false, hint: 'Coming soon' },
    { icon: ArrowDownIcon, label: 'Withdraw', primary: false, hint: 'Coming soon' },
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
          </p>
          <div className="flex items-baseline gap-0.5 font-display tabular-nums">
            <span className="text-[34px] leading-none font-light tracking-tight opacity-50">$</span>
            <span className="text-[54px] leading-none font-light tracking-tight">{whole}.</span>
            <span className="text-[34px] leading-none font-light tracking-tight">{cents}</span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          {actions.map(({ icon: Icon, label, primary, hint, onClick }) => (
            <div key={label} className="group relative">
              <button
                type="button"
                onClick={hint ? undefined : onClick}
                aria-disabled={hint ? true : undefined}
                className="flex w-[72px] flex-col items-center gap-1 aria-disabled:cursor-not-allowed"
              >
                <div
                  className={`flex size-12 items-center justify-center rounded-full ${primary ? 'bg-primary' : 'bg-muted'}`}
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
                  className="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 rounded-md bg-card px-3 py-1.5 text-xs whitespace-nowrap text-foreground ring-1 ring-border group-hover:block"
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
