import { useEffect, useState } from 'react'
import { useNavigate, useParams, useRouteLoaderData } from '@remix-run/react'
import { format, getDay, parse } from 'date-fns'
import { ArrowLeft, HandCoins } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Textarea } from '~/components/ui/textarea'
import { cartStore } from '../../hooks/cartStore'
import { type loader } from '../route'
import { Sheet, SheetContent } from './components/CartSheet'

export default function CartPage() {
  const [isOpen, setIsOpen] = useState(true)
  const data = useRouteLoaderData<typeof loader>(
    'routes/_marketing+/s/$slug/route',
  )
  const units = data?.data?.units
  const numberOfUnits = units?.length
  const acceptsOrdersOutsideBusinessHours =
    data?.data?.acceptsOrdersOutsideBusinessHours
  const hasUnitWithPhoneNumber = units?.some(unit => unit.phone)
  const [selectedUnit, setSelectedUnit] = useState(units?.[0]?.id.toString())
  const [customerName, setCustomerName] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')

  const selectedUnitTypeOfDelivery = units?.find(
    unit => unit.id.toString() === selectedUnit,
  )?.typeOfDelivery
  const selectedUnitBusinessHours = units?.find(
    unit => unit.id.toString() === selectedUnit,
  )?.businessHours
  const isSelectedStoreOpen = selectedUnitIsOpen(selectedUnitBusinessHours)
  const selectedUnitPhoneNumber = units?.find(
    unit => unit.id.toString() === selectedUnit,
  )?.phone

  const [editMode, setEditMode] = useState<null | {
    itemId?: string
    productCartId: string
    initialQuantity: number
    quantity: number
  }>(null)
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>(
    selectedUnitTypeOfDelivery === 'deliveryAndPickup'
      ? 'delivery'
      : selectedUnitTypeOfDelivery === 'onlyDelivery'
        ? 'delivery'
        : 'pickup',
  )

  const order: OrderDetails = {
    customerName: customerName,
    items: cartStore.cart.map(cartItem => {
      const productDetails = data?.data?.categories
        .flatMap(category => category.products)
        .find(product => product.id === cartItem.id) // Assuming cartItem.id corresponds to product.id

      if (!productDetails) {
        throw new Error(
          `Product details not found for cart item with ID: ${cartItem.id}`,
        )
      }

      return {
        name: productDetails.name,
        quantity: cartItem.quantity,
        price: (
          ((cartItem.price +
            cartItem.customizationItems.reduce(
              (acc, item) => acc + item.price * item.quantity,
              0,
            )) *
            cartItem.quantity) /
          100
        ).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
      }
    }),
    total:
      deliveryType === 'delivery'
        ? `Entrega (mais) ` +
          (
            cartStore.cart.reduce((acc, item) => {
              return (
                acc +
                (item.price +
                  item.customizationItems.reduce(
                    (acc, item) => acc + item.price * item.quantity,
                    0,
                  )) *
                  item.quantity
              )
            }, 0) / 100
          ).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })
        : (
            cartStore.cart.reduce((acc, item) => {
              return (
                acc +
                (item.price +
                  item.customizationItems.reduce(
                    (acc, item) => acc + item.price * item.quantity,
                    0,
                  )) *
                  item.quantity
              )
            }, 0) / 100
          ).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }),
    phoneNumber: `55${selectedUnitPhoneNumber}`,
    typeOfDelivery: deliveryType,
    address: customerAddress,
  }

  // Generate the link
  const whatsappLink = generateWhatsAppLink(order)

  useEffect(() => {
    if (selectedUnitTypeOfDelivery === 'onlyDelivery') {
      setDeliveryType('delivery')
    } else if (selectedUnitTypeOfDelivery === 'onlyPickup') {
      setDeliveryType('pickup')
    }
  }, [selectedUnitTypeOfDelivery])

  const getSelectedProductsData = () => {
    return cartStore.cart.map(cartItem => {
      const productDetails = data?.data?.categories
        .flatMap(category => category.products)
        .find(product => product.id === cartItem.id) // Assuming cartItem.id corresponds to product.id

      if (!productDetails) {
        throw new Error(
          `Product details not found for cart item with ID: ${cartItem.id}`,
        )
      }

      return {
        ...cartItem,
        productDetails,
      }
    })
  }
  const selectedProductsData = getSelectedProductsData()

  const navigate = useNavigate()
  const params = useParams()

  useEffect(() => {
    if (isOpen === false) {
      navigate(`/s/${params.slug}`, {
        preventScrollReset: true,
      })
    }
  }, [isOpen, navigate, params.slug])

  if (hasUnitWithPhoneNumber === false || !numberOfUnits) {
    return (
      <div>
        Não é possível finalizar a compra sem a empresa cadastrar um número de
        telefone.
      </div>
    )
  }

  const isDisabled =
    (isSelectedStoreOpen === false &&
      acceptsOrdersOutsideBusinessHours === false) ||
    cartStore.cart.length === 0

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          onOpenAutoFocus={e => e.preventDefault()}
          className="z-[9999] h-full bg-white p-0"
          side={'bottom'}
        >
          <div className="relative h-full w-full">
            <div className="absolute inset-x-0 top-0 z-20 bg-white py-3">
              <div className="h-full w-full">
                <button
                  className="absolute left-2 top-4 z-20"
                  onClick={() => {
                    setIsOpen(false)
                  }}
                >
                  <ArrowLeft className="h-full w-full text-orange-500" />
                </button>

                <h2 className="flex justify-center text-xl font-semibold">
                  Meu carrinho
                </h2>
              </div>
            </div>
            <div className="h-full w-full overflow-y-scroll pt-12">
              <div className="flex flex-col pb-16">
                {/* Store logo + Name + Location (with accordion) - Only show location if the number of the unit is setup */}
                <div className="flex items-center justify-between px-5 py-6">
                  <div>
                    <h1 className="text-xl font-medium">{data?.data?.title}</h1>
                  </div>
                  {data?.data?.logoUrl ? (
                    <div className="h-20 w-20 overflow-hidden rounded-full">
                      <img
                        src={data.data.logoUrl}
                        alt="logo"
                        className="h-20 w-20 rounded-full"
                      />
                    </div>
                  ) : null}
                </div>

                <div className="">
                  <h3 className="my-4 px-4 text-lg font-medium">
                    Detalhes da Entrega
                  </h3>

                  {/* Select Unit */}
                  {numberOfUnits > 1 ? (
                    <div className="px-4">
                      <Label htmlFor="unit" className="text-left">
                        Unidade
                      </Label>
                      <Select
                        value={selectedUnit?.toString()}
                        onValueChange={setSelectedUnit}
                      >
                        <SelectTrigger>
                          <SelectValue aria-label={selectedUnit}>
                            {
                              units?.find(
                                unit => unit.id.toString() === selectedUnit,
                              )?.name
                            }
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="z-[9999]">
                          <SelectGroup className="max-h-48 overflow-y-scroll">
                            {units.map(unit => (
                              <SelectItem
                                key={unit.id}
                                value={unit.id.toString()}
                              >
                                {unit.name} - {unit.address}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="px-4">
                      <p>
                        {units?.[0]?.name} - {units?.[0]?.address}
                      </p>
                    </div>
                  )}
                </div>

                {/* If the selected options is delivery open field to user type his adress */}
                <RadioGroup
                  className="z-0 mt-2 flex flex-col gap-y-4 px-4 sm:flex-row sm:gap-x-4 sm:gap-y-0"
                  value={deliveryType}
                  onValueChange={value => {
                    console.log('value', value)

                    setDeliveryType(value as 'delivery' | 'pickup')
                  }}
                >
                  {/* Check type of delivery of the selected store and layout the options */}
                  {selectedUnitTypeOfDelivery === 'onlyDelivery' ? (
                    <Label
                      htmlFor="delivery"
                      className="relative flex w-fit items-center space-x-6 rounded-md border p-4"
                    >
                      <RadioGroupItem
                        className="text-orange-500"
                        value="delivery"
                        id="delivery"
                      />
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-xs font-medium text-zinc-600">
                          Entrega
                        </p>
                      </div>
                    </Label>
                  ) : null}
                  {selectedUnitTypeOfDelivery === 'onlyPickup' ? (
                    <Label
                      htmlFor="pickup"
                      className="relative flex w-fit items-center space-x-6 rounded-md border p-4"
                    >
                      <RadioGroupItem
                        className="text-orange-500"
                        value="pickup"
                        id="pickup"
                      />
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-xs font-medium text-zinc-600">
                          Retirada
                        </p>
                      </div>
                    </Label>
                  ) : null}
                  {selectedUnitTypeOfDelivery === 'deliveryAndPickup' ? (
                    <div className="flex gap-x-2">
                      <Label
                        htmlFor="delivery"
                        className="relative flex items-center space-x-6 rounded-md border p-4"
                      >
                        <RadioGroupItem
                          className="text-orange-500"
                          value="delivery"
                          id="delivery"
                        />
                        <div className="flex flex-col items-center justify-center">
                          <p className="text-xs font-medium text-zinc-600">
                            Entrega
                          </p>
                        </div>
                      </Label>
                      <Label
                        htmlFor="pickup"
                        className="relative flex items-center space-x-6 rounded-md border p-4"
                      >
                        <RadioGroupItem
                          className="text-orange-500"
                          value="pickup"
                          id="pickup"
                        />
                        <div className="flex flex-col items-center justify-center">
                          <p className="text-xs font-medium text-zinc-600">
                            Retirada
                          </p>
                        </div>
                      </Label>
                    </div>
                  ) : null}
                </RadioGroup>

                {/* Detalhes da Entrega - Se entrega estiver disponível */}

                {deliveryType === 'delivery' ? (
                  <div className="mt-4 flex flex-col gap-y-2 px-4">
                    <Label htmlFor="address" className="text-left">
                      Seu endereço (obrigatório)
                    </Label>
                    <Textarea
                      id="address"
                      name="address"
                      placeholder="Digite seu endereço"
                      className="col-span-3 text-base"
                      value={customerAddress}
                      onChange={e => setCustomerAddress(e.target.value)}
                    />
                  </div>
                ) : null}

                <div className="mt-4 flex flex-col gap-y-2 px-4">
                  <Label htmlFor="cusotmerName" className="text-left">
                    Seu nome (obrigatório)
                  </Label>
                  <Input
                    id="cusotmerName"
                    name="cusotmerName"
                    placeholder="Digite seu nome"
                    className="col-span-3 text-base"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                  />
                </div>

                <div className="mt-4 px-4">
                  {isSelectedStoreOpen ? null : acceptsOrdersOutsideBusinessHours ? (
                    <div className="flex items-center space-x-3 rounded-md border border-green-600 bg-gradient-to-r from-green-50 to-transparent px-4 py-1">
                      <span className="text-lg">✅</span>

                      <span className="text-sm text-green-700">
                        Essa unidade está fechada no momento, mas aceita pedidos
                        fora do horário de funcionamento. Finalize seu pedido e
                        a loja te retornará assim que reabrir.
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3 rounded-md border border-red-400 bg-gradient-to-r from-red-50 to-transparent px-4 py-1">
                      <span className="text-sm">❌</span>

                      <span className="text-xs text-red-700">
                        Essa unidade está fechada no momento, e não aceita
                        pedidos fora do horário de funcionamento.
                      </span>
                    </div>
                  )}
                </div>

                {/* Se a loja estiver fechada mostre o texto */}
                {/* Loja fechada no momento. Mas você pode finalizar o pedido com a opção de retirada para pegar o produto depois que a loja reabrir. */}

                {/* Divider */}
                <div className="mt-4 h-2 w-full bg-gray-100" />

                <div className="flex flex-col">
                  <h3 className="my-4 px-4 text-lg font-medium">
                    Dados do Pedido
                  </h3>
                  {selectedProductsData.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {selectedProductsData.map((item, index) => {
                        return (
                          <div
                            key={index}
                            className={`flex h-auto min-h-[90px] flex-col gap-2 border-b border-gray-200 px-4 py-2`}
                          >
                            <div className="flex w-full items-start justify-between gap-x-8">
                              <div className="flex w-full flex-col">
                                <p className="text-sm">
                                  {item.quantity}x {item.name}
                                </p>
                                <p>
                                  {item.customizationItems.map(
                                    customizationItem => {
                                      return (
                                        <span
                                          key={customizationItem.id}
                                          className="text-sm text-gray-600"
                                        >
                                          {customizationItem.quantity}x{' '}
                                          {customizationItem.name}
                                        </span>
                                      )
                                    },
                                  )}
                                </p>
                                <p className="text-sm font-semibold text-gray-600">
                                  {(
                                    ((item.price +
                                      item.customizationItems.reduce(
                                        (acc, item) =>
                                          acc + item.price * item.quantity,
                                        0,
                                      )) *
                                      item.quantity) /
                                    100
                                  ).toLocaleString('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                  })}
                                </p>
                                {editMode ? null : (
                                  <button
                                    onClick={() => {
                                      setEditMode({
                                        itemId: item.id,
                                        productCartId: item.productCartId,
                                        quantity: item.quantity,
                                        initialQuantity: item.quantity,
                                      })
                                    }}
                                    className="w-fit text-sm font-medium text-orange-500"
                                  >
                                    Editar
                                  </button>
                                )}
                              </div>
                              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                                <img
                                  src={item.productDetails.itemImages[0]}
                                  alt={item.productDetails.name}
                                  className="h-16 w-16 rounded-lg"
                                />
                              </div>
                            </div>
                            {editMode &&
                            editMode.productCartId === item.productCartId ? (
                              <div className="flex gap-x-2">
                                <div className="flex w-fit items-center rounded-lg border bg-white">
                                  <button
                                    disabled={editMode.quantity === 0}
                                    onClick={() => {
                                      setEditMode(prev => {
                                        if (prev) {
                                          return {
                                            ...prev,
                                            quantity: prev.quantity - 1,
                                          }
                                        }

                                        return prev
                                      })
                                    }}
                                    className="px-4 py-2 text-orange-600 focus:outline-none disabled:text-gray-300"
                                  >
                                    -
                                  </button>
                                  <div>
                                    <p>{editMode.quantity}</p>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setEditMode(prev => {
                                        if (prev) {
                                          return {
                                            ...prev,
                                            quantity: prev.quantity + 1,
                                          }
                                        }

                                        return prev
                                      })
                                    }}
                                    className="px-4 py-2 text-orange-600 focus:outline-none"
                                  >
                                    +
                                  </button>
                                </div>
                                {editMode.quantity === 0 ? (
                                  <button
                                    onClick={() => {
                                      const itemToEdit = cartStore.cart.find(
                                        cartItem =>
                                          cartItem.productCartId ===
                                          item.productCartId,
                                      )

                                      if (!itemToEdit) {
                                        return
                                      }

                                      cartStore.cart = cartStore.cart.filter(
                                        cartItem =>
                                          cartItem.productCartId !==
                                          item.productCartId,
                                      )
                                      setEditMode(null)
                                    }}
                                    className="w-fit rounded-xl bg-[#e8453e] px-4 py-2 text-sm font-medium text-white"
                                  >
                                    Remover
                                  </button>
                                ) : null}
                                {editMode.quantity !==
                                  editMode.initialQuantity &&
                                editMode.quantity !== 0 ? (
                                  <button
                                    onClick={() => {
                                      const itemToEdit = cartStore.cart.find(
                                        cartItem =>
                                          cartItem.productCartId ===
                                          item.productCartId,
                                      )

                                      if (!itemToEdit) {
                                        return
                                      }

                                      itemToEdit.quantity = editMode.quantity
                                      setEditMode(null)
                                    }}
                                    className="w-fit rounded-xl bg-[#28a745] px-4 py-2 text-sm font-medium text-white"
                                  >
                                    Atualizar
                                  </button>
                                ) : null}
                                <button
                                  onClick={() => {
                                    setEditMode(null)
                                  }}
                                  className="w-fit rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-500"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : null}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center">
                      <p className="text-gray-500">Seu carrinho está vazio.</p>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setIsOpen(false)
                    }}
                    className="mt-4 text-center text-orange-600"
                  >
                    Adicionar mais items
                  </button>
                </div>

                {/* Divider */}
                <div className="my-4 h-2 w-full bg-gray-100" />

                {/* Ideia - Cupom - Aplicar cupom de desconto */}
                {/* Resumo do pedido */}
                <div className="flex flex-col px-4 pb-4">
                  <h3 className="flex items-center gap-x-2 text-lg font-semibold text-gray-900">
                    <HandCoins className="text-orange-600" />
                    Resumo do Pedido
                  </h3>
                  <div className="mt-2 flex flex-col gap-2">
                    <div className="flex justify-between">
                      <p>Subtotal</p>
                      <p>
                        {(
                          cartStore.cart.reduce((acc, item) => {
                            return (
                              acc +
                              (item.price +
                                item.customizationItems.reduce(
                                  (acc, item) =>
                                    acc + item.price * item.quantity,
                                  0,
                                )) *
                                item.quantity
                            )
                          }, 0) / 100
                        ).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </p>
                    </div>
                  </div>
                  {deliveryType === 'delivery' ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between">
                        <p>Entrega</p>
                        <p className="text-sm">A combinar</p>
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-2 flex justify-between">
                    <p className="font-semibold">Total</p>
                    <p className="font-semibold">
                      {deliveryType === 'delivery' ? 'Entrega + ' : null}

                      {(
                        cartStore.cart.reduce((acc, item) => {
                          return (
                            acc +
                            (item.price +
                              item.customizationItems.reduce(
                                (acc, item) => acc + item.price * item.quantity,
                                0,
                              )) *
                              item.quantity
                          )
                        }, 0) / 100
                      ).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 flex w-full justify-between bg-white px-4 py-3">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                onClick={e => {
                  // Prevent navigation if the link is disabled
                  if (isDisabled) {
                    e.preventDefault()
                  }

                  if (customerName.length === 0) {
                    e.preventDefault()
                    toast.error('Por favor, preencha seu nome.')
                    return
                  }

                  if (
                    deliveryType === 'delivery' &&
                    customerAddress.length === 0
                  ) {
                    e.preventDefault()
                    toast.error('Por favor, preencha seu endereço.')
                    return
                  }
                }}
                className={`inline-block w-full rounded-lg px-6 py-2 text-center text-white  ${
                  isDisabled
                    ? 'pointer-events-none bg-gray-400' // Disables link interaction
                    : 'bg-[#28a745]'
                }`}
              >
                Continuar
              </a>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

const indexToDay = (index: number): string => {
  const days = [
    'Domingo',
    'Segunda',
    'Terça',
    'Quarta',
    'Quinta',
    'Sexta',
    'Sábado',
  ]
  return days[index]
}

const selectedUnitIsOpen = (
  selectedUnitBusinessHours:
    | {
        id: number
        day: string
        open: string
        close: string
        unitId: number
      }[]
    | undefined,
): boolean => {
  if (!selectedUnitBusinessHours) return false

  const now = new Date()
  const currentDayIndex = getDay(now)
  const currentDayPortuguese = indexToDay(currentDayIndex)
  const currentTimeString = format(now, 'HH:mm')

  const todayBusinessHours = selectedUnitBusinessHours.find(
    bh => bh.day === currentDayPortuguese,
  )

  if (!todayBusinessHours || todayBusinessHours.open === 'closed') {
    return false
  }

  // Parse the current, open, and close times as dates on the same day
  const currentDate = parse(currentTimeString, 'HH:mm', new Date())
  const openDate = parse(todayBusinessHours.open, 'HH:mm', new Date())
  const closeDate = parse(todayBusinessHours.close, 'HH:mm', new Date())

  // Compare the times
  return currentDate >= openDate && currentDate <= closeDate
}

interface OrderDetails {
  customerName: string
  items: { name: string; quantity: number; price: string }[]
  total: string
  phoneNumber: string
  typeOfDelivery: 'delivery' | 'pickup'
  address?: string
}

const generateWhatsAppLink = (orderDetails: OrderDetails): string => {
  // Base URL for sending WhatsApp messages
  const baseURL = 'https://wa.me/'

  // Construct the message
  let message = `
  Oi, aqui estão os detalhes do meu pedido:\n\nItens:\n`
  orderDetails.items.forEach((item, index) => {
    message += `${index + 1}. ${item.name}\n`
    message += `Quantidade: ${item.quantity}, Preço: ${item.price}\n`
  })
  message += `--------------------------------\n\n`
  message += `Nome: ${orderDetails.customerName}\n`
  message += `Tipo de entrega: ${orderDetails.typeOfDelivery === 'delivery' ? 'Entrega' : 'Retirada'}\n`
  if (orderDetails.typeOfDelivery === 'delivery') {
    message += `Endereço: ${orderDetails.address}\n\n`
  }
  message += `Total: ${orderDetails.total}`

  // Encode the message to be URL-safe
  const encodedMessage = encodeURIComponent(message)

  // Return the complete URL
  return `${baseURL}${orderDetails.phoneNumber}?text=${encodedMessage}`
}
