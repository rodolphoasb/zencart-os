import { createId } from '@paralleldrive/cuid2'
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect,
} from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { clientDb } from 'db'
import { jsonWithError } from 'remix-toast'
import { getTenant } from '~/utils/getTenant.server'
import { Faqs } from './components/Faqs'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Pricing } from './components/Pricing'
import { PrimaryFeatures } from './components/PrimaryFeatures'
import { SecondaryFeatures } from './components/SecondaryFeatures'
import { Testimonials } from './components/Testimonials'

export const meta: MetaFunction = () => {
  return [
    { title: 'Zencart - Catálogo digital descomplicado' },
    {
      property: 'og:title',
      content: 'Zencart - Catálogo digital descomplicado',
    },
    {
      name: 'description',
      content:
        'Facilite a vida do seu cliente e aumente em até 3 vezes as suas vendas. Com a Zencart você cria uma catálogo digital para sua loja em poucos minutos.',
    },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { tenant, tld, domain } = getTenant(request)

  const isTestingTenantLocally =
    process.env.NODE_ENV === 'development' &&
    Boolean(tenant) &&
    domain === 'localhost'

  if (isTestingTenantLocally === false) {
    if (!tld || (tld === 'io' && tenant === 'www') || domain === 'ngrok-free') {
      return json({ isTenant: false, data: null })
    }
  }

  return redirect(
    process.env.NODE_ENV === 'development'
      ? `http://localhost:3000/s/${tenant}`
      : `https://zencart.io/s/${tenant}`,
    302,
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()

  const name = formData.get('name') as string
  const phoneNumber = formData.get('phoneNumber') as string

  if (!name || !phoneNumber || phoneNumber.length === 0 || name.length === 0) {
    return jsonWithError({ ok: false }, 'Preencha todos os campos')
  }

  const unMaskedPhone = phoneNumber.replace(/\D/g, '')

  await clientDb
    .insertInto('Lead')
    .values({
      id: createId(),
      name,
      phone: unMaskedPhone,
    })
    .execute()

  return json({ ok: true })
}

export default function Index() {
  const loaderData = useLoaderData<typeof loader>()

  if (loaderData.isTenant === false) {
    return (
      <>
        <Header />
        <main>
          <Hero />
          <PrimaryFeatures />
          <SecondaryFeatures />
          {/* <CallToAction /> */}
          <Testimonials />
          <Pricing />
          <Faqs />
        </main>
        <Footer />
      </>
    )
  }

  return <div></div>
}
