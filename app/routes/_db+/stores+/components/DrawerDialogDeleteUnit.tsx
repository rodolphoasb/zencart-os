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
import type { loader } from '../_index/route'

export function DrawerDialogDeleteUnit({ unitId }: { unitId: number }) {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery('only screen and (min-width : 768px)')
  const fetcher = useFetcher<typeof loader>({ key: 'deleteUnit' })
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
            className="flex items-center justify-center rounded-lg text-xs text-gray-500 hover:bg-gray-50"
            variant={'link'}
          >
            <Trash2 className="h-4 w-4 text-gray-400" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Deletar unidade</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar essa unidade?
            </DialogDescription>
          </DialogHeader>
          <DeleteForm unitId={unitId} />
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
          <Trash2 className="h-4 w-4 text-gray-400" />
          <p>Deletar</p>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Deletar unidade</DrawerTitle>
          <DrawerDescription>
            Tem certeza que deseja deletar essa unidade?
          </DrawerDescription>
        </DrawerHeader>
        <DeleteForm unitId={unitId} className="px-4 pb-8" />
      </DrawerContent>
    </Drawer>
  )
}

function DeleteForm({
  className,
  unitId,
}: {
  className?: string
  unitId: number
}) {
  const fetcher = useFetcher({ key: 'deleteUnit' })
  const isPending =
    fetcher.state === 'submitting' || fetcher.state === 'loading'

  return (
    <fetcher.Form
      action="?/deleteUnit"
      method="post"
      className={cn('grid items-start gap-4', className)}
    >
      <div className="mt-8 flex justify-end gap-x-4">
        <input type="hidden" name="unitId" value={unitId} />

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
