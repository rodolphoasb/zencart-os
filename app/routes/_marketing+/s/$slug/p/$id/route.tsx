import { useEffect, useRef, useState } from 'react'
import { createId } from '@paralleldrive/cuid2'
import { useNavigate, useParams, useRouteLoaderData } from '@remix-run/react'
import { Textarea } from '~/components/ui/textarea'
import { cartStore } from '../../../hooks/cartStore'
import { type loader } from '../../route'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../components/ImageCarousel'
import { Sheet, SheetContent } from '../components/ProductSheet'

interface CustomizationQuantityItem {
  categoryId: number
  itemId: number
  quantity: number
  price: number
  name: string
}

export default function ProductPage() {
  const [isOpen, setIsOpen] = useState(true)
  const params = useParams()
  const productId = params.id
  const data = useRouteLoaderData<typeof loader>(
    'routes/_marketing+/s/$slug/route',
  )
  const [isExpanded, setIsExpanded] = useState(false)
  const [showToggleButton, setShowToggleButton] = useState(false)
  const descriptionRef = useRef<HTMLParagraphElement>(null)

  const navigate = useNavigate()
  const [numberOfProductOrders, setNumberOfProductOrders] = useState(1)
  const [quantities, setQuantities] = useState<CustomizationQuantityItem[]>([])
  const [orderObservation, setOrderObservation] = useState('')
  const [
    totalSumOfProductAndCustomizations,
    setTotalSumOfProductAndCustomizations,
  ] = useState(0)
  const productData = productId
    ? data?.data?.categories
        .find(category => category.productIds.includes(productId))
        ?.products.find(product => product.id === productId)
    : null

  function addOrderToCart() {
    const id = createId()

    if (productData) {
      const product = {
        id: productId,
        productCartId: id,
        name: productData.name,
        price: productData.price,
        quantity: numberOfProductOrders,
        customizationItems: quantities
          .filter(q => q.quantity > 0)
          .map(q => ({
            id: q.itemId,
            name: q.name,
            price: q.price,
            quantity: q.quantity,
          })),
        observation: orderObservation,
      }

      cartStore.cart.push(product)

      setIsOpen(false)
    }
  }

  useEffect(() => {
    const element = descriptionRef.current
    if (element) {
      const lineHeight = 24
      const maxHeight = lineHeight * 3
      if (element.scrollHeight > maxHeight) {
        setShowToggleButton(true)
      } else {
        setShowToggleButton(false)
      }
    }
  }, [productData?.description])

  useEffect(() => {
    if (productData) {
      const productPrice = productData.price
      setTotalSumOfProductAndCustomizations(productPrice)
    }
  }, [productData])

  useEffect(() => {
    if (quantities.length === 0) {
      return
    }

    const sum = quantities.reduce(
      (acc, quantityItem) => acc + quantityItem.price * quantityItem.quantity,
      0,
    )

    setTotalSumOfProductAndCustomizations(
      ((productData?.price as number) + sum) * numberOfProductOrders,
    )
  }, [quantities, numberOfProductOrders, productData])

  useEffect(() => {
    if (!productId) {
      return
    }

    const newQuantities: CustomizationQuantityItem[] =
      data?.data?.categories
        .find(category => category.productIds.includes(productId))
        ?.products.find(product => product.id === productId)
        ?.customizationCategories.flatMap(category =>
          category.itemCustomizations.map(item => ({
            name: item.name,
            categoryId: category.id,
            itemId: item.id,
            quantity: 0, // Default quantity
            price: item.price,
          })),
        ) || []

    setQuantities(newQuantities)
  }, [productId, data])

  const updateQuantity = (
    categoryId: number,
    itemId: number,
    delta: number,
  ) => {
    setQuantities(currentQuantities =>
      currentQuantities.map(quantityItem =>
        quantityItem.categoryId === categoryId && quantityItem.itemId === itemId
          ? {
              ...quantityItem,
              quantity: quantityItem.quantity + delta,
            }
          : quantityItem,
      ),
    )
  }

  useEffect(() => {
    if (isOpen === false) {
      navigate(`/s/${params.slug}`, {
        preventScrollReset: true,
      })
    }
  }, [isOpen, navigate, params.slug])

  if (!productId) {
    return null
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          onOpenAutoFocus={e => e.preventDefault()}
          className="z-[9999] h-full bg-white p-0"
          side={'bottom'}
        >
          <div className="relative h-full w-full">
            <div className="h-full w-full overflow-y-scroll">
              <div className="flex flex-col pb-16">
                {/* Images */}
                <Carousel className="w-full">
                  <CarouselContent>
                    {productData?.itemImages.map((image, index) => (
                      <CarouselItem key={image}>
                        <div
                          className="h-56 w-full overflow-hidden"
                          key={index}
                        >
                          <img
                            src={image}
                            alt="product"
                            className="h-full w-full object-contain"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>

                <div className="mt-8 px-4">
                  <h1 className="text-xl font-bold">{productData?.name}</h1>
                  <div>
                    <p
                      ref={descriptionRef}
                      className={`whitespace-pre-wrap text-sm ${!isExpanded ? 'line-clamp-3' : ''}`}
                    >
                      {productData?.description}
                    </p>
                    {showToggleButton ? (
                      <button
                        onClick={() => {
                          setIsExpanded(!isExpanded)
                        }}
                        className="text-sm text-gray-500 underline hover:text-gray-700"
                      >
                        {isExpanded ? 'ver menos' : 'ver mais'}
                      </button>
                    ) : null}
                  </div>
                  <p className="mt-2 font-semibold">
                    {productData?.priceType === 'is'
                      ? `${formatCurrency(productData?.price / 100)}`
                      : `a partir de ${formatCurrency(
                          (productData?.price as number) / 100,
                        )}`}
                  </p>
                </div>

                <div className="mt-6 flex flex-col">
                  {/* Customizations */}
                  {productData?.customizationCategories?.map(customization => {
                    return (
                      <div key={customization.id} className="flex flex-col">
                        <div className="flex h-[70px] items-center justify-between bg-zinc-100 px-4 py-4">
                          <div className="flex flex-col">
                            <p className="text-lg font-medium">
                              {customization.name}
                            </p>
                            {customization.min > 0 ? (
                              <span className="flex text-xs text-gray-500">
                                Mínimo de {customization.min} e máximo de{' '}
                                {customization.max}
                              </span>
                            ) : null}
                          </div>
                          {customization.min > 0 ? (
                            <span className="flex h-[25px] items-center justify-center rounded-full bg-gray-500 px-2 py-0.5 text-[11px] font-medium uppercase text-white">
                              Obrigatório
                            </span>
                          ) : (
                            <span className="flex h-[25px] items-center justify-center rounded-full bg-gray-500 px-2 py-0.5 text-[11px] font-medium uppercase text-white">
                              Opcional
                            </span>
                          )}
                        </div>
                        <div className="divide-y-[1px]">
                          {customization.itemCustomizations.map(item => (
                            <div
                              className="flex items-center justify-between p-4"
                              key={item.id}
                            >
                              <div className="flex flex-col">
                                <label htmlFor={item.id.toString()}>
                                  {item.name}
                                </label>
                                {item.price > 0 ? (
                                  <p className="text-sm font-medium">
                                    + {formatCurrency(Number(item.price) / 100)}
                                  </p>
                                ) : null}
                              </div>
                              <div className="flex w-fit items-center rounded-lg border">
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      customization.id,
                                      item.id,
                                      -1,
                                    )
                                  }
                                  className="px-4 py-2 text-orange-600 focus:outline-none disabled:text-gray-300"
                                  disabled={
                                    quantities.find(
                                      q =>
                                        q.categoryId === customization.id &&
                                        q.itemId === item.id,
                                    )?.quantity === 0
                                  }
                                >
                                  -
                                </button>
                                <span>
                                  {
                                    quantities.find(
                                      q =>
                                        q.categoryId === customization.id &&
                                        q.itemId === item.id,
                                    )?.quantity
                                  }
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(customization.id, item.id, 1)
                                  }
                                  className="px-4 py-2 text-orange-600 focus:outline-none"
                                  disabled={
                                    quantities.find(
                                      q =>
                                        q.categoryId === customization.id &&
                                        q.itemId === item.id,
                                    )?.quantity === customization.max
                                  }
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                  <div className="flex flex-col">
                    <div className="flex h-[70px] items-center justify-between bg-zinc-100 px-4 py-2">
                      <h2 className="text-lg font-medium">
                        Alguma observação?
                      </h2>
                      <span className="flex h-[25px] items-center justify-center rounded-full bg-gray-500 px-2 py-0.5 text-[11px] font-medium uppercase text-white">
                        Opcional
                      </span>
                    </div>
                    <div className="px-4 py-4">
                      <Textarea
                        value={orderObservation}
                        onChange={e => setOrderObservation(e.target.value)}
                        placeholder="Escreva sua observação aqui"
                        className="resize-none px-2 py-2 text-base"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 flex w-full justify-between bg-white px-4 py-2">
              <div className="flex w-fit items-center rounded-lg border">
                <button
                  disabled={numberOfProductOrders === 1}
                  onClick={() => {
                    setNumberOfProductOrders(numberOfProductOrders - 1)
                  }}
                  className="px-4 py-2 text-orange-600 focus:outline-none disabled:text-gray-300"
                >
                  -
                </button>
                <div>
                  <p>{numberOfProductOrders}</p>
                </div>
                <button
                  onClick={() => {
                    setNumberOfProductOrders(numberOfProductOrders + 1)
                  }}
                  className="px-4 py-2 text-orange-600 focus:outline-none"
                >
                  +
                </button>
              </div>
              <button
                onClick={addOrderToCart}
                className="rounded-lg bg-[#28a745] px-6 py-2 text-white"
              >
                Adicionar{' '}
                {formatCurrency(totalSumOfProductAndCustomizations / 100)}
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}
