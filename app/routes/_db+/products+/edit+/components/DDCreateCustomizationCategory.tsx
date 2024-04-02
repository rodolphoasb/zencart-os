'use client'

import * as React from 'react'
import { useFetcher } from '@remix-run/react'
import { useMediaQuery } from '@uidotdev/usehooks'
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

export function DDCreateItemCustomizationCategory() {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery('only screen and (min-width : 768px)')
  const fetcher = useFetcher<typeof loader>({
    key: 'createCustomizationCategory',
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
          <Button2 color="white">Adicionar customização</Button2>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Criar categoria de customização</DialogTitle>
            <DialogDescription>
              Crie customizações para o seu produto. Exemplo: Tamanho, Cor, etc.
            </DialogDescription>
          </DialogHeader>
          <CreateCustomizationCategoryForm />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button2 color="white">Adicionar customização</Button2>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Criar categoria de customização</DrawerTitle>
          <DrawerDescription>
            Crie customizações para o seu produto. Exemplo: Tamanho, Cor, etc.
          </DrawerDescription>
        </DrawerHeader>
        <CreateCustomizationCategoryForm className="px-4 pb-12" />
      </DrawerContent>
    </Drawer>
  )
}

function CreateCustomizationCategoryForm({
  className,
}: React.ComponentProps<'div'>) {
  const fetcher = useFetcher({ key: 'createCustomizationCategory' })
  const isPending =
    fetcher.state === 'submitting' || fetcher.state === 'loading'

  return (
    <fetcher.Form
      method="post"
      action="?/createCustomizationCategory"
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
        />
      </div>
      <Button2
        className={`mt-4`}
        status={isPending ? 'pending' : 'idle'}
        type="submit"
      >
        Salvar
      </Button2>
    </fetcher.Form>
  )
}
