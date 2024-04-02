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
import type { Option } from '~/components/ui/multi-select'
import { MultipleSelector } from '~/components/ui/multi-select'
import { cn } from '~/utils'
import type { loader } from '../route'

export function DrawerDialogCreateCategory({
  children,
  tags,
}: {
  children: React.ReactNode
  tags: {
    id: string
    name: string
    storeId: string
    createdAt: string
  }[]
}) {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery('only screen and (min-width : 768px)')
  const fetcher = useFetcher<typeof loader>({ key: 'createCategory' })
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
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crie sua categoria</DialogTitle>
            <DialogDescription>
              Essa é uma das categorias que irão aparecer dentro da sua loja.
            </DialogDescription>
          </DialogHeader>
          <CreateCategoryForm tags={tags} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="h-[60%]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Crie sua categoria</DrawerTitle>
          <DrawerDescription>
            Essa é uma das categorias que irão aparecer dentro da sua loja.
          </DrawerDescription>
        </DrawerHeader>
        <CreateCategoryForm tags={tags} className="px-4" />
      </DrawerContent>
    </Drawer>
  )
}

function CreateCategoryForm({
  className,
  tags,
}: {
  className?: string
  tags: {
    id: string
    name: string
    storeId: string
    createdAt: string
  }[]
}) {
  const [selectedTags, setSelectedTags] = React.useState<Option[]>([])
  const fetcher = useFetcher({ key: 'createCategory' })
  const isPending =
    fetcher.state === 'submitting' || fetcher.state === 'loading'

  return (
    <fetcher.Form
      method="post"
      action="?/createCategory"
      className={cn('grid items-start gap-2', className)}
    >
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="name" className="text-left">
          Nome
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="Ex: Camisetas"
          className="col-span-3 text-base"
        />
      </div>
      <h2 className="text-sm font-medium text-gray-600">Tags relacionadas</h2>
      <MultipleSelector
        value={selectedTags}
        onChange={setSelectedTags}
        defaultOptions={tags.map(tag => ({
          id: tag.id,
          value: tag.name,
          label: tag.name,
        }))}
        placeholder="Selecione as tags relacionadas"
        emptyIndicator={
          <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
            Nenhum resultado encontrado.
          </p>
        }
        inputProps={{
          className: 'md:text-sm focus:outline-none text-base focus:ring-0',
        }}
        badgeClassName="w-fit bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100"
      />
      <input
        type="hidden"
        name="categoryTags"
        value={JSON.stringify(selectedTags.map(tag => ({ id: tag.id })))}
      />
      <Button2 status={isPending ? 'pending' : 'idle'} type="submit">
        Salvar
      </Button2>
    </fetcher.Form>
  )
}
