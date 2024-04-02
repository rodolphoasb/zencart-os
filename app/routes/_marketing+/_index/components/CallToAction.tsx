import posthog from 'posthog-js'
import { Button2 } from '~/components/ui/button2'
import { Container } from './Container'

export function CallToAction() {
  return (
    <section
      id="get-started-today"
      className="relative overflow-hidden bg-orange-500 py-32"
    >
      {/* <img
        className="absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2"
        src={'/images/background-call-to-action.jpg'}
        alt=""
        width={2347}
        height={1244}
      /> */}
      <Container className="relative">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Comece hoje mesmo
          </h2>
          <p className="mt-4 text-lg tracking-tight text-white">
            Chegou a hora de você controlar as suas vendas e cortar custos. Crie
            agora sua loja em menos de 10 minutos!
          </p>
          <Button2
            href="https://pay.kiwify.com.br/ybcO2sO"
            color="dark"
            className="mt-10 h-16 w-52 md:text-base"
            onClick={() => {
              posthog.capture('clicked_buy_now')
            }}
          >
            Criar minha loja
          </Button2>
        </div>
      </Container>
    </section>
  )
}
