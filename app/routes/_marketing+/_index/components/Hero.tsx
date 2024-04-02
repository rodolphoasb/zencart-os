import { ClientOnly } from 'remix-utils/client-only'
import { Container } from './Container'
import { DrawerDialogWatchVideo } from './DrawerDialogWatchVideo'

export function Hero() {
  return (
    <Container className="pb-16 pt-12 text-center lg:pb-32 lg:pt-20">
      <h1 className="mx-auto max-w-4xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-6xl">
        Crie seu catálogo digital de produtos e receba pedidos direto no
        WhatsApp
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-slate-700">
        Facilite a vida do seu cliente e venda mais. Sem taxas. Sem comissões. E
        o melhor: sem mensalidade. Pague uma vez e use para sempre.
      </p>
      {/* <div className="mt-6 flex justify-center">
        <div className="w-fit rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 p-[1.5px]">
          <div className="w-fit rounded-full bg-white px-4">
            <p className="text-sm font-medium">
              ⏰ Condição exclusiva para os 100 primeiros compradores
            </p>
          </div>
        </div>
      </div> */}
      <div className="mt-10 flex justify-center gap-x-6">
        {/* <Button2
          rel="noopener noreferrer"
          target="_blank"
          href="https://pay.kiwify.com.br/ybcO2sO"
          onClick={() => {
            posthog.capture('clicked_buy_now')
          }}
        >
          Começar agora
        </Button2> */}
        <ClientOnly>{() => <DrawerDialogWatchVideo />}</ClientOnly>
      </div>
    </Container>
  )
}
