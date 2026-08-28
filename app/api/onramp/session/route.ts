import {
  createOnrampServerKit,
  createSessionRouteHandler,
} from '@crcl-main/onramp-kit/server'

// `.env.example` points these at sandbox. Leaving them unset falls back to the
// kit's own defaults, https://api.circle.com and https://onramp.arc.io, which
// is mainnet and moves real money.
const server = createOnrampServerKit({
  kitKey: process.env.ONRAMP_KIT_KEY!,
  baseUrl: process.env.ONRAMP_API_BASE_URL,
  widgetBaseUrl: process.env.NEXT_PUBLIC_ONRAMP_WIDGET_BASE_URL,
})

export const POST = createSessionRouteHandler(server)
