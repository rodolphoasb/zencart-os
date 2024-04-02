'use client'

import * as React from 'react'
import { useFetcher } from '@remix-run/react'
import { useMediaQuery } from '@uidotdev/usehooks'
import { Trash2 } from 'lucide-react'
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
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '~/components/ui/drawer'
import { cn } from '~/utils'
import type { loader } from '../route'

export function DrawerDialogDeleteProduct({
  productId,
}: {
  productId: string
}) {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery('only screen and (min-width : 768px)')
  const fetcher = useFetcher<typeof loader>({
    key: 'deleteProduct',
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
            <Trash2 className="h-4 w-4" />
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Deletar produto</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar esse produto?
            </DialogDescription>
          </DialogHeader>
          <DeleteForm productId={productId} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button className="flex h-11 w-11 items-center justify-center gap-x-2 rounded-lg text-sm text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-700">
          <Trash2 className="h-4 w-4" />
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Deletar produto</DrawerTitle>
          <DrawerDescription>
            Tem certeza que deseja deletar esse produto?
          </DrawerDescription>
        </DrawerHeader>
        <DeleteForm productId={productId} className="px-4 pb-8" />
      </DrawerContent>
    </Drawer>
  )
}

function DeleteForm({
  className,
  productId,
}: {
  className?: string
  productId: string
}) {
  const fetcher = useFetcher({ key: 'deleteProduct' })
  const isPending =
    fetcher.state === 'submitting' || fetcher.state === 'loading'

  return (
    <fetcher.Form
      action="?/deleteProduct"
      method="post"
      className={cn('grid items-start gap-4', className)}
    >
      <div className="mt-8 flex justify-end gap-x-4">
        <input type="hidden" name="productId" value={productId} />

        <DrawerClose asChild>
          <Button variant="link" className="w-fit">
            Cancelar
          </Button>
        </DrawerClose>

        <Button2
          status={isPending ? 'pending' : 'idle'}
          type="submit"
          color="red"
          className="w-fit"
        >
          Deletar
        </Button2>
      </div>
    </fetcher.Form>
  )
}
