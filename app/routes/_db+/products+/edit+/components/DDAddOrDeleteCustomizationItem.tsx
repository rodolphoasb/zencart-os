'use client'

import * as React from 'react'
import { useFetcher } from '@remix-run/react'
import { useMediaQuery } from '@uidotdev/usehooks'
import { Diff, XIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Button2 } from '~/components/ui/button2'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '~/components/ui/drawer'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import type { loader } from '../$productId'

export function DDAddOrDeleteCustomizationItem({
  customizationCategoryId,
  customizationItems,
}: {
  customizationCategoryId: number
  customizationItems: {
    id: number
    name: string
    price: number
    createdAt: string
    updatedAt: string
    orderItemId: number | null
    customizationCategoryId: number
  }[]
}) {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery('only screen and (min-width : 768px)')
  const fetcher = useFetcher<typeof loader>({
    key: 'CreateOrDeleteCustomizationItem',
  })
  const isPending =
    fetcher.state === 'submitting' || fetcher.state === 'loading'

  React.useEffect(() => {
    if (isPending === false && fetcher.data?.ok) {
      setOpen(false)
    }
  }, [fetcher.data, isPending])

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="flex h-11 w-11 items-center justify-center gap-x-2 rounded-lg text-sm text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-700">
            <Diff className="h-4 w-4" />
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicione ou remova item na customização</DialogTitle>
            <DialogDescription>
              Altere os items da sua customização.
            </DialogDescription>
          </DialogHeader>
          <CreateOrDeleteCustomizationItem
            customizationCategoryId={customizationCategoryId}
            customizationItems={customizationItems}
          />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button className="flex h-11 w-11 items-center justify-center gap-x-2 rounded-lg text-sm text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-700">
          <Diff className="h-4 w-4" />
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Adicione ou remova item na customização</DrawerTitle>
          <DrawerDescription>
            Altere os items da sua customização.
          </DrawerDescription>
        </DrawerHeader>
        <CreateOrDeleteCustomizationItem
          customizationCategoryId={customizationCategoryId}
          customizationItems={customizationItems}
          className="px-4"
        />
      </DrawerContent>
    </Drawer>
  )
}

function CreateOrDeleteCustomizationItem({
  className,
  customizationCategoryId,
  customizationItems,
}: {
  className?: string
  customizationCategoryId: number
  customizationItems: {
    id: number
    name: string
    price: number
    createdAt: string
    updatedAt: string
    orderItemId: number | null
    customizationCategoryId: number
  }[]
}) {
  const fetcher = useFetcher({ key: 'CreateOrDeleteCustomizationItem' })
  const isPending =
    fetcher.state === 'submitting' || fetcher.state === 'loading'

  // State to hold the list of customization items
  const [customizationItemsValues, setCustomizationItemsValues] =
    React.useState<
      | {
          name: string
          price: string | number
        }[]
      | typeof customizationItems
    >(
      customizationItems.length > 0
        ? customizationItems
        : [
            {
              name: '',
              price: 'R$ 0,00',
            },
          ],
    )

  const addItem = () => {
    setCustomizationItemsValues([
      ...customizationItemsValues,
      { name: '', price: 'R$ 0,00' }, // Add a new item with empty values
    ])
  }

  const removeItem = (index: number) => {
    setCustomizationItemsValues(
      customizationItemsValues.filter((_, itemIndex) => index !== itemIndex),
    )
  }

  function formatCurrency(value: string) {
    const numericValue = value.replace(/\D/g, '')
    const formattedValue = (Number(numericValue) / 100).toLocaleString(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL',
      },
    )
    return formattedValue
  }

  function handlePriceChange(value: string, index: number) {
    const onlyDigits = value.replace(/\D/g, '')
    if (onlyDigits.length <= 10) {
      const formattedValue = formatCurrency(value)
      // Update the state with numeric value for server and formatted value for display
      setCustomizationItemsValues(
        customizationItemsValues.map((item, itemIndex) =>
          index === itemIndex ? { ...item, price: formattedValue } : item,
        ),
      )
    }
  }

  return (
    <>
      <div className="w-full px-4">
        <Button
          variant={'outline'}
          type="button"
          onClick={addItem}
          className="mb-4 w-full"
        >
          Adicionar item
        </Button>
      </div>
      <fetcher.Form
        method="post"
        action="?/createOrDeleteCustomizationItem"
        className={`flex flex-col gap-y-2 ${className}`}
      >
        {customizationItemsValues.map((item, index) => (
          <div key={index} className="relative flex gap-x-4 rounded border p-4">
            <div className="flex flex-col gap-y-2">
              <Label
                htmlFor={`itemCustomizationName-${index}`}
                className="text-left"
              >
                Nome
              </Label>
              <Input
                id={`itemCustomizationName-${index}`}
                name={`itemCustomizationName-${index}`}
                placeholder="Ex: 150g"
                className="col-span-3 text-base sm:text-sm"
                value={item.name}
                onChange={e =>
                  setCustomizationItemsValues(
                    customizationItemsValues.map((item, itemIndex) =>
                      index === itemIndex
                        ? { ...item, name: e.target.value }
                        : item,
                    ),
                  )
                }
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <Label
                htmlFor={`itemCustomizationPrice-${index}`}
                className="text-left"
              >
                Preço
              </Label>
              <Input
                id={`itemCustomizationPrice-${index}`}
                name={`itemCustomizationPrice-${index}`}
                placeholder="Ex: 9.90"
                className="col-span-3 text-base sm:text-sm"
                type="string"
                value={formatCurrency(item.price.toString())}
                onChange={e => handlePriceChange(e.target.value, index)}
              />
            </div>
            <button
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border bg-white text-gray-400"
              onClick={() => removeItem(index)}
              type="button"
            >
              <XIcon className="h-3 w-3" />
            </button>
          </div>
        ))}
        <input
          type="hidden"
          name="customizationCategoryId"
          value={customizationCategoryId}
        />
        <input
          type="hidden"
          name="customizationItems"
          value={JSON.stringify(customizationItemsValues)}
        />
        <Button2
          className={`mt-6`}
          status={isPending ? 'pending' : 'idle'}
          type="submit"
        >
          Salvar
        </Button2>
      </fetcher.Form>
    </>
  )
}
