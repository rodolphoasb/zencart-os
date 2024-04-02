import { useEffect } from 'react'
import { Link, useParams } from '@remix-run/react'
import { useIntersectionObserver } from '@uidotdev/usehooks'

type setIntersectionSections = React.Dispatch<
  React.SetStateAction<
    {
      name: string
      Ycoord: number
    }[]
  >
>

export function Layout1({
  categoriesWithProducts,
  setIntersectionSections,
}: {
  categoriesWithProducts: {
    name: string
    tags: string[]
    products: ({
      tags: {
        id: string
        name: string
        storeId: string
        createdAt: string
      }[]
    } & {
      id: string
      name: string
      description: string | null
      price: number
      itemImages: string[]
      isAvailable: boolean
      priceType: string
    })[]
  }[]
  setIntersectionSections: setIntersectionSections
}) {
  return (
    <div className="mt-3 pb-16">
      {categoriesWithProducts.map(item => (
        <CategoryProducts
          setIntersectionSections={setIntersectionSections}
          category={item.name}
          products={item.products}
          key={item.name}
        />
      ))}
    </div>
  )
}

function CategoryProducts({
  category,
  products,
  setIntersectionSections,
}: {
  category: string
  products: ({
    tags: {
      id: string
      name: string
      storeId: string
      createdAt: string
    }[]
  } & {
    id: string
    name: string
    description: string | null
    price: number
    itemImages: string[]
    isAvailable: boolean
    priceType: string
  })[]
  setIntersectionSections: setIntersectionSections
}) {
  const params = useParams()
  const slug = params.slug
  const [ref, entry] = useIntersectionObserver({
    threshold: 0,
    root: null,
    rootMargin: '0px',
  })

  useEffect(() => {
    if (entry?.isIntersecting) {
      setIntersectionSections(prev => {
        if (prev.some(section => section.name === category)) {
          return prev
        }

        return [
          ...prev,
          { name: category, Ycoord: entry.boundingClientRect.top },
        ]
      })
    } else {
      setIntersectionSections(prev =>
        prev.filter(section => section.name !== category),
      )
    }
  }, [entry, category])

  return (
    <div
      ref={ref}
      id={`${category}`}
      className="relative scroll-smooth"
      key={category}
    >
      <div className="bg-zinc-100 px-4 py-4">
        <h2 className="text-lg font-medium">{category}</h2>
      </div>
      <div>
        {products.map(product => (
          <Link
            className="flex h-[140px] max-h-[140px] justify-between rounded-lg border-b px-4 py-5 last:border-b-0"
            key={product.name}
            to={`/s/${slug}/p/${product.id}`}
            preventScrollReset
          >
            <div className="flex flex-col justify-between">
              <div className="flex flex-col">
                <p className="line-clamp-1 font-medium">{product.name}</p>
                <p className="line-clamp-2 text-xs text-zinc-400">
                  {product.description}
                </p>
              </div>
              <div>
                {product.priceType === 'startsAt' && (
                  <p className="font-medium">
                    {' '}
                    a partir de{' '}
                    {(product.price / 100).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </p>
                )}
                {product.priceType === 'is' && (
                  <p className="font-medium">
                    {(product.price / 100).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </p>
                )}
              </div>
            </div>
            {product.itemImages.length > 0 ? (
              <div className="h-[100px] w-[100px] shrink-0 overflow-hidden rounded-xl">
                <img
                  className="h-full w-full object-cover"
                  src={product.itemImages[0]}
                  alt="Product"
                />
              </div>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  )
}
