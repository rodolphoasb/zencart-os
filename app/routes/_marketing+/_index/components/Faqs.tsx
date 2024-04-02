import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion'
import { Container } from './Container'

const faqs = [
  {
    question: 'Como o Zencart functiona com o WhatsApp?',
    answer:
      'Seus clientes podem navegar pela sua loja no Zencart, adicionar produtos ao carrinho e enviar os detalhes do pedido diretamente para o vendedor via WhatsApp. Isso simplifica o processo de pedidos para clientes e comerciantes.',
  },
  {
    question: 'Quais garantias eu tenho?',
    answer:
      'O risco é todo nosso. Se não gostar ou sentir que não é para você, devolvemos todo seu dinheiro dentro dos primeiros 7 dias.',
  },
  {
    question: 'Existe um limite de produtos que posso adicionar?',
    answer:
      'Não, você pode adicionar quantos produtos quiser. A única limitação é em relação às fotos. Cada loja pode ter no máximo 1000 fotos. Para comprar um pacote de 1000 fotos adicionais (R$ 99,00 - uma única vez), entre em contato conosco.',
  },

  {
    question: 'Existe algum contrato de fidelidade? E taxas escondidas?',
    answer: 'Não, você compra o Zencart e ele é seu. Sem taxas escondidas.',
  },
  {
    question: 'Existe algum limite de quantidade de pedidos?',
    answer:
      'Não, você pode receber quantos pedidos quiser. Existimos para ajudar você a prosperar, quanto mais pedidos melhor!',
  },
  {
    question: 'Perdi minha senha. Como faço para recuperá-la?',
    answer:
      'Você pode recuperar sua senha clicando em "Esqueceu sua senha?" na tela de login. Você receberá um e-mail com um link para redefinir sua senha.',
  },
]

export function Faqs() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="relative overflow-hidden bg-gray-50 py-20 sm:pb-24 sm:pt-24"
    >
      {/* <img
        className="absolute left-1/2 top-0 max-w-none -trangray-y-1/4 trangray-x-[-30%]"
        src={'/images/background-faqs.jpg'}
        alt=""
        width={1558}
        height={946}
      /> */}
      <Container className="relative">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2
            id="faq-title"
            className="text-3xl font-semibold tracking-tight text-gray-900"
          >
            Perguntas frequentes
          </h2>
          <p className="mt-4 text-lg tracking-tight text-gray-700">
            Não encontrou o que procurava? Manda um oi e a gente te ajuda! 👋
          </p>
        </div>
        <Accordion className="mt-8" type="single" collapsible>
          {faqs.map(({ question, answer }, index: number) => (
            <AccordionItem
              className="last:border-b-0"
              value={`item-${index}`}
              key={index}
            >
              <AccordionTrigger className="text-left text-base text-gray-700">
                {question}
              </AccordionTrigger>
              <AccordionContent className="text-base">
                {answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </section>
  )
}
