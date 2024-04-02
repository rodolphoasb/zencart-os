import { createId } from '@paralleldrive/cuid2'
import { json, type LoaderFunctionArgs, redirect } from '@remix-run/node'
import * as crypto from 'crypto'
import { clientDb } from 'db'
import { prepareVerification } from '~/routes/_auth+/verification.server'

export async function action({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const signature = url.searchParams.get('signature')

  if (request.method !== 'POST') {
    return json({
      statusText: 'Método não permitido.',
      status: 405,
    })
  }

  if (!signature) {
    return json({
      statusText: 'Não autorizado.',
      status: 401,
    })
  }

  const body = await request.json()
  const data = JSON.stringify(body)

  const secret = process.env.KIWIFY_TOKEN!
  const signatureFromURL = signature

  const isValid: boolean = signatureFromURL
    ? verifySignature(data, secret, signatureFromURL)
    : false

  if (!isValid) {
    return json({
      statusText: 'Não autorizado.',
      status: 401,
    })
  }

  const eventType = getKiwifyEventType(body)

  switch (eventType) {
    case 'KIWIFY_GENERATED_BOLETO':
      return
    case 'KIWIFY_GENERATED_PIX':
      return
    case 'KIWIFY_PURCHASE_DECLINED':
      return
    case 'KIWIFY_PURCHASE_APPROVED':
      await handlePaymentApproved(body, request)
      return
    case 'KIWIFY_REFUND':
      return handleRefund(body)
    case 'KIWIFY_CHARGEBACK':
      return handleRefund(body)
    default:
      return json({
        statusText: 'Evento não suportado.',
        status: 400,
      })
  }
}

async function handlePaymentApproved(body: OrderBody, request: Request) {
  const id = createId()
  const email = body.Customer.email

  // Save event
  await clientDb
    .insertInto('KiwifyEvents')
    .values({
      id,
      name: 'KIWIFY_PURCHASE_APPROVED',
      updatedAt: new Date(),
      webhookData: body,
    })
    .execute()

  if (email) {
    // Check if the user already exists
    const user = await clientDb
      .selectFrom('User')
      .selectAll()
      .where('User.email', '=', email)
      .executeTakeFirst()

    if (user) {
      return json({ ok: true, message: 'User already exists' })
    }
  }

  // Save user
  await clientDb
    .insertInto('User')
    .values({
      id: createId(),
      email: email,
      name: body.Customer.full_name,
      updatedAt: new Date(),
    })
    .execute()

  const { verifyUrl, redirectTo } = await prepareVerification({
    period: 60 * 60 * 24,
    request,
    type: 'onboarding',
    target: email,
  })

  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.LOOPS_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transactionalId: 'clswn72v801d12olr2osyxyyf',
      email: email,
      dataVariables: {
        verificationUrl: verifyUrl,
      },
    }),
  }

  try {
    const response = await fetch(
      'https://app.loops.so/api/v1/transactional',
      options,
    )
    const jsonResponse = await response.json()

    console.log('jsonResponse', jsonResponse)

    if (jsonResponse.success === true) {
      return redirect(redirectTo.toString())
    } else {
      return json({ ok: false, error: jsonResponse.error }, 400)
    }
  } catch (err) {
    console.log(err)
    return json({ ok: false, error: err }, 400)
  }
}

function handleRefund(body: any) {
  console.log('body', body)

  return body
}

function verifySignature(
  data: string,
  secret: string,
  expectedSignature: string,
): boolean {
  const hmac = crypto.createHmac('sha1', secret)
  hmac.update(data)
  const calculatedSignature = hmac.digest('hex')
  return calculatedSignature === expectedSignature
}

function getKiwifyEventType(body: any): KiwifyDbEventTypes {
  if (
    body.order_status === 'waiting_payment' &&
    body.payment_method === 'boleto'
  ) {
    return 'KIWIFY_GENERATED_BOLETO'
  }

  if (
    body.order_status === 'waiting_payment' &&
    body.payment_method === 'pix'
  ) {
    return 'KIWIFY_GENERATED_PIX'
  }

  if (body.status === 'abandoned') {
    return 'KIWIFY_ABANDONED_CART'
  }

  if (
    body.order_status === 'refused' &&
    body.payment_method === 'credit_card'
  ) {
    return 'KIWIFY_PURCHASE_DECLINED'
  }

  if (body.order_status === 'paid' && body.approved_date !== null) {
    return 'KIWIFY_PURCHASE_APPROVED'
  }

  if (body.order_status === 'refunded') {
    return 'KIWIFY_REFUND'
  }

  if (body.order_status === 'chargedback') {
    return 'KIWIFY_CHARGEBACK'
  }

  if (body.Subscription.status === 'waiting_payment') {
    return 'KIWIFY_SUBSCRIPTION_DELAYED'
  }

  if (body.order_status === 'paid' && body.Subscription.status === 'active') {
    return 'KIWIFY_SUBSCRIPTION_RENEWED'
  }

  return 'KIWIFY_SUBSCRIPTION_CANCELLED'
}

const eventTypesKiwify = [
  {
    name: 'Boleto gerado',
    type: 'GeneratedTicket',
    dbEventType: 'KIWIFY_GENERATED_BOLETO',
  },
  {
    name: 'Pix gerado',
    type: 'GeneratedPix',
    dbEventType: 'KIWIFY_GENERATED_PIX',
  },
  {
    name: 'Carrinho abandonado',
    type: 'AbandonedCart',
    dbEventType: 'KIWIFY_ABANDONED_CART',
  },
  {
    name: 'Compra recusada',
    type: 'PurchaseDeclined',
    dbEventType: 'KIWIFY_PURCHASE_DECLINED',
  },
  {
    name: 'Compra aprovada',
    type: 'PurchaseApproved',
    dbEventType: 'KIWIFY_PURCHASE_APPROVED',
  },
  { name: 'Reembolso', type: 'Refund', dbEventType: 'KIWIFY_REFUND' },
  { name: 'Chargeback', type: 'Chargeback', dbEventType: 'KIWIFY_CHARGEBACK' },
  {
    name: 'Assinatura cancelada',
    type: 'SubscriptionCancelled',
    dbEventType: 'KIWIFY_SUBSCRIPTION_CANCELLED',
  },
  {
    name: 'Assinatura atrasada',
    type: 'SubscriptionDelayed',
    dbEventType: 'KIWIFY_SUBSCRIPTION_DELAYED',
  },
  {
    name: 'Assinatura renovada',
    type: 'SubscriptionRenewed',
    dbEventType: 'KIWIFY_SUBSCRIPTION_RENEWED',
  },
] as const

type KiwifyDbEventTypes = (typeof eventTypesKiwify)[number]['dbEventType']

type OrderBody = {
  order_id: string
  order_ref: string
  order_status: 'paid' // Assuming order_status has a fixed set of possible string values, you can use union types to represent them, e.g., 'paid' | 'pending' | 'cancelled'
  product_type: 'membership' // Similarly, if there are limited possible values, use union types
  payment_method: 'credit_card' // Adjust according to possible values
  store_id: string
  payment_merchant_id: string
  installments: number
  card_type: 'mastercard' // Adjust according to possible values
  card_last4digits: string
  card_rejection_reason: string | null
  boleto_URL: string | null
  boleto_barcode: string | null
  boleto_expiry_date: string | null
  pix_code: string | null
  pix_expiration: string | null
  sale_type: 'producer' // Adjust according to possible values
  created_at: string // ISO date string
  updated_at: string // ISO date string
  approved_date: string // ISO date string
  refunded_at: string | null
  webhook_event_type: 'order_approved' // Adjust according to possible values
  Product: {
    product_id: string
    product_name: string
  }
  Customer: {
    full_name: string
    email: string
    mobile: string
    CPF: string
    ip: string
  }
  Commissions: {
    charge_amount: string
    product_base_price: string
    kiwify_fee: string
    commissioned_stores: any[] // Define more specifically if the structure of objects in the array is known
    my_commission: string
    funds_status: string | null
    estimated_deposit_date: string | null
    deposit_date: string | null
  }
  TrackingParameters: {
    src: string | null
    sck: string | null
    utm_source: string | null
    utm_medium: string | null
    utm_campaign: string | null
    utm_content: string | null
    utm_term: string | null
  }
  Subscription: {
    id: string
    start_date: string // ISO date-time string
    next_payment: string // ISO date-time string
    status: 'active' // Adjust according to possible values
    plan: {
      id: string
      name: string
      frequency: 'weekly' // Adjust according to possible values
      qty_charges: number
    }
    charges: {
      completed: any[] // Define more specifically if the structure of objects in the array is known
      future: any[] // Define more specifically if the structure of objects in the array is known
    }
  }
  subscription_id: string
  access_url: string | null
}
