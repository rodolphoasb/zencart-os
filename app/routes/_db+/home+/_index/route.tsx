import { type MetaFunction } from '@remix-run/node'

export const meta: MetaFunction = () => {
  return [
    { title: 'Home | Zencart' },
    {
      property: 'og:title',
      content: 'Home | Zencart',
    },
    {
      name: 'description',
      content:
        'Seja bem vindo a Zencart! Nessa parte do site você pode gerenciar seu catálogo digital.',
    },
  ]
}

export default function Screen() {
  return (
    <div className="flex flex-col">
      <div className="mb-12 flex flex-col items-center justify-between sm:flex-row">
        <h1 className="flex items-center text-lg font-semibold text-gray-600">
          Olá, seja bem-vindo!
        </h1>
      </div>
      <div>
        <h2 className="font-medium text-gray-600">
          Primeiros passos para você começar a usar seu Zencart:
        </h2>
        <div className="mt-6 flex flex-col gap-y-3 text-gray-600">
          <p>1. Acesse o menu lateral e clique na aba empresas</p>
          <p>
            2. Configure os dados da sua empresa e cadastre uma Unidade (É aqui
            onde você adiciona o número do seu WhatsApp).
          </p>
          <p>
            3. Após a sua empresa estar configurada, chegou a hora de criar seus
            produtos!
          </p>
          <p>
            4. Acesse o menu lateral e clique na aba produtos, lá você pode
            adicionar, editar e excluir seus produtos.
          </p>
          <p>
            5. Após finalizar a criação dos seus produtos, acesse a aba
            categorias e adicione categorias para os seus produtos (as
            categorias que você cria aqui vão aparecer no seu catálogo digital).
          </p>
          <p>
            6. Pronto! Agora você já pode compartilhar o link do seu catálogo
            digital com seus clientes.
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-y-3 text-gray-600">
          <h2 className="font-medium text-gray-600">Tutoriais em vídeo</h2>
          <a
            target="_blank"
            rel="noreferrer noopener"
            className="text-orange-600 underline"
            href="https://www.loom.com/share/27654949e0dc48cb8efe7b49402cca97?sid=d4778278-ed83-4913-a323-5701195aa4ec"
          >
            Criando um produto e uma categoria
          </a>
        </div>
      </div>
    </div>
  )
}
