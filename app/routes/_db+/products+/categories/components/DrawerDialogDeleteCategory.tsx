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
import { type loader } from '../route'

export function DrawerDialogDeleteCategory({
  categoryId,
}: {
  categoryId: string
}) {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery('only screen and (min-width : 768px)')
  const fetcher = useFetcher<typeof loader>({ key: 'deleteCategory' })
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
            <DialogTitle>Deletar categoria</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar essa categoria?
            </DialogDescription>
          </DialogHeader>
          <DeleteForm categoryId={categoryId} />
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
          <DrawerTitle>Deletar categoria</DrawerTitle>
          <DrawerDescription>
            Tem certeza que deseja deletar essa categoria?
          </DrawerDescription>
        </DrawerHeader>
        <DeleteForm categoryId={categoryId} className="mb-8 px-4" />
      </DrawerContent>
    </Drawer>
  )
}

function DeleteForm({
  className,
  categoryId,
}: {
  className?: string
  categoryId: string
}) {
  const fetcher = useFetcher({ key: 'deleteCategory' })
  const isPending =
    fetcher.state === 'submitting' || fetcher.state === 'loading'

  return (
    <fetcher.Form
      action="?/deleteCategory"
      method="post"
      className={cn('grid items-start gap-4', className)}
    >
      <div className="mt-8 flex justify-end gap-x-4">
        <input type="hidden" name="categoryId" value={categoryId} />

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
