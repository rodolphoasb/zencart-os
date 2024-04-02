'use client'

import * as React from 'react'
import { useFetcher } from '@remix-run/react'
import { useMediaQuery } from '@uidotdev/usehooks'
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
import { Label } from '~/components/ui/label'
import { Switch } from '~/components/ui/switch'
import { cn } from '~/utils'
import type { loader } from '../_index/route'

export function DrawerDialogConfigVisibility({
  isVisible,
  acceptsOrdersOutsideBusinessHours,
  acceptsOrdersOnWhatsapp,
}: {
  isVisible: boolean
  acceptsOrdersOutsideBusinessHours: boolean
  acceptsOrdersOnWhatsapp: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery('only screen and (min-width : 768px)')
  const fetcher = useFetcher<typeof loader>({ key: 'updateVisibility' })
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
          <Button
            className="w-full gap-x-2 text-xs text-gray-500"
            variant={'outline'}
          >
            Ajustar visibilidade e detalhes dos pedidos
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Visibilidade e Pedidos</DialogTitle>
            <DialogDescription>
              Ajuste a visibilidade e detalhes dos pedidos
            </DialogDescription>
          </DialogHeader>
          <ConfigVisibilityForm
            isVisible={isVisible}
            acceptsOrdersOnWhatsapp={acceptsOrdersOnWhatsapp}
            acceptsOrdersOutsideBusinessHours={
              acceptsOrdersOutsideBusinessHours
            }
          />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          className="w-full gap-x-2 text-xs text-gray-500"
          variant={'outline'}
        >
          Ajustar visibilidade e detalhes dos pedidos
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Visibilidade e Pedidos</DrawerTitle>
          <DrawerDescription>
            Ajuste a visibilidade e detalhes dos pedidos
          </DrawerDescription>
        </DrawerHeader>
        <ConfigVisibilityForm
          isVisible={isVisible}
          acceptsOrdersOnWhatsapp={acceptsOrdersOnWhatsapp}
          acceptsOrdersOutsideBusinessHours={acceptsOrdersOutsideBusinessHours}
          className="px-4 pb-8"
        />
      </DrawerContent>
    </Drawer>
  )
}

function ConfigVisibilityForm({
  isVisible,
  acceptsOrdersOutsideBusinessHours,
  acceptsOrdersOnWhatsapp,
  className,
}: {
  isVisible: boolean
  acceptsOrdersOutsideBusinessHours: boolean
  acceptsOrdersOnWhatsapp: boolean
  className?: string
}) {
  const fetcher = useFetcher({ key: 'updateVisibility' })
  const [storeIsVisible, setStoreIsVisible] = React.useState(isVisible)
  const [
    storeAcceptsOrdersOutsideBusinessHours,
    setStoreAcceptsOrdersOutsideBusinessHours,
  ] = React.useState(acceptsOrdersOutsideBusinessHours)
  const [storeAcceptsOrdersOnWhatsapp, setStoreAcceptsOrdersOnWhatsapp] =
    React.useState(acceptsOrdersOnWhatsapp)
  const isPending =
    fetcher.state === 'submitting' || fetcher.state === 'loading'

  console.log('storeIsVisible', storeIsVisible)

  return (
    <form
      action="?/updateVisibility"
      method="post"
      className={cn('flex w-full flex-col gap-y-4', className)}
      onSubmit={e => {
        e.preventDefault()
        e.stopPropagation()
        const formData = new FormData()
        formData.append('storeIsVisible', storeIsVisible.toString())
        formData.append(
          'storeAcceptsOrdersOutsideBusinessHours',
          storeAcceptsOrdersOutsideBusinessHours.toString(),
        )
        formData.append(
          'storeAcceptsOrdersOnWhatsapp',
          storeAcceptsOrdersOnWhatsapp.toString(),
        )

        fetcher.submit(formData, {
          action: '?/updateVisibility',
          method: 'post',
        })
      }}
    >
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="category" className="text-left">
          Loja visível
        </Label>
        <Switch
          id="storeIsVisible"
          name="storeIsVisible"
          checked={storeIsVisible}
          onCheckedChange={setStoreIsVisible}
        />
      </div>
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="category" className="text-left">
          Receber pedidos por WhatsApp
        </Label>
        <Switch
          id="storeAcceptsOrdersOnWhatsapp"
          name="storeAcceptsOrdersOnWhatsapp"
          checked={storeAcceptsOrdersOnWhatsapp}
          onCheckedChange={setStoreAcceptsOrdersOnWhatsapp}
        />
      </div>
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="category" className="text-left">
          Aceitar pedidos fora do horário
        </Label>
        <Switch
          id="storeAcceptsOrdersOutsideBusinessHours"
          name="storeAcceptsOrdersOutsideBusinessHours"
          checked={storeAcceptsOrdersOutsideBusinessHours}
          onCheckedChange={setStoreAcceptsOrdersOutsideBusinessHours}
        />
      </div>
      <Button2
        status={isPending ? 'pending' : 'idle'}
        type="submit"
        className="w-full"
      >
        Salvar
      </Button2>
    </form>
  )
}
