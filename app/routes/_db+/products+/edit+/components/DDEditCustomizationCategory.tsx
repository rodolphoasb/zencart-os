'use client'

import * as React from 'react'
import { useFetcher } from '@remix-run/react'
import { useMediaQuery } from '@uidotdev/usehooks'
import { Edit } from 'lucide-react'
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
import { cn } from '~/utils'
import type { loader } from '../$productId'

export function DDEditCustomizationCategory({
  customizationCategoryId,
  customizationName,
  customizationMin,
  customizationMax,
}: {
  customizationCategoryId: number
  customizationName: string
  customizationMin: number
  customizationMax: number
}) {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery('only screen and (min-width : 768px)')
  const fetcher = useFetcher<typeof loader>({
    key: 'editCustomizationCategory',
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
            <Edit className="h-4 w-4" />
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Criar customização</DialogTitle>
            <DialogDescription>
              Esse é o espaço para você fazer alterações no layout da sua loja.
            </DialogDescription>
          </DialogHeader>
          <StylesForm
            customizationName={customizationName}
            customizationMin={customizationMin}
            customizationMax={customizationMax}
            customizationCategoryId={customizationCategoryId}
          />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button className="flex h-11 w-11 items-center justify-center gap-x-2 rounded-lg text-sm text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-700">
          <Edit className="h-4 w-4" />
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Criar customização</DrawerTitle>
          <DrawerDescription>
            Esse é o espaço para você fazer alterações no layout da sua loja.
          </DrawerDescription>
        </DrawerHeader>
        <StylesForm
          customizationName={customizationName}
          customizationMin={customizationMin}
          customizationMax={customizationMax}
          customizationCategoryId={customizationCategoryId}
          className="px-4"
        />
      </DrawerContent>
    </Drawer>
  )
}

function StylesForm({
  className,
  customizationCategoryId,
  customizationName,
  customizationMin,
  customizationMax,
}: {
  className?: string
  customizationCategoryId: number
  customizationName: string
  customizationMin: number
  customizationMax: number
}) {
  const fetcher = useFetcher({ key: 'editCustomizationCategory' })
  const isPending =
    fetcher.state === 'submitting' || fetcher.state === 'loading'

  return (
    <fetcher.Form
      method="post"
      action="?/editCustomizationCategory"
      className={cn('grid items-start gap-2', className)}
    >
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="customizationName" className="text-left">
          Nome
        </Label>
        <Input
          id="customizationName"
          name="customizationName"
          placeholder="Ex: Tamanho"
          className="col-span-3 text-base sm:text-sm"
          defaultValue={customizationName}
        />
      </div>
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="customizationMin" className="text-left">
          Mínimo
        </Label>
        <Input
          id="customizationMin"
          name="customizationMin"
          placeholder="Ex: 1"
          className="col-span-3 text-base sm:text-sm"
          type="number"
          defaultValue={customizationMin}
        />
      </div>
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="customizationMax" className="text-left">
          Máximo
        </Label>
        <Input
          id="customizationMax"
          name="customizationMax"
          placeholder="Ex: 10"
          className="col-span-3 text-base sm:text-sm"
          type="number"
          defaultValue={customizationMax}
        />
      </div>
      <input
        type="hidden"
        name="customizationCategoryId"
        value={customizationCategoryId}
      />
      <Button2 status={isPending ? 'pending' : 'idle'} type="submit">
        Salvar
      </Button2>
    </fetcher.Form>
  )
}
