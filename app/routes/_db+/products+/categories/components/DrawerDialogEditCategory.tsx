'use client'

import * as React from 'react'
import { useFetcher, useRouteLoaderData } from '@remix-run/react'
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
import type { Option } from '~/components/ui/multi-select'
import { MultipleSelector } from '~/components/ui/multi-select'
import { cn } from '~/utils'
import { type loader } from '../route'

export function DrawerDialogEditCategory({
  tags,
  categoryId,
  categoryName,
}: {
  tags: {
    id: string
    name: string
    storeId: string
    createdAt: string
  }[]
  categoryId: string
  categoryName: string
}) {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery('only screen and (min-width : 768px)')
  const data = useRouteLoaderData<typeof loader>(
    'routes/_db+/products+/categories/route',
  )
  const fetcher = useFetcher<typeof loader>({ key: 'updateCategory' })
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
            <DialogTitle>Edite sua categoria</DialogTitle>
            <DialogDescription>
              Essa é uma das categorias que irão aparecer dentro da sua loja.
            </DialogDescription>
          </DialogHeader>
          <EditCategoryForm
            categoryName={categoryName}
            tags={tags}
            allTags={data?.data.tags ?? []}
            categoryId={categoryId}
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
          <DrawerTitle>Edite sua categoria</DrawerTitle>
          <DrawerDescription>
            Essa é uma das categorias que irá aparecer dentro da sua loja.
          </DrawerDescription>
        </DrawerHeader>
        <EditCategoryForm
          categoryName={categoryName}
          tags={tags}
          className="px-4"
          allTags={data?.data.tags ?? []}
          categoryId={categoryId}
        />
      </DrawerContent>
    </Drawer>
  )
}

function EditCategoryForm({
  className,
  tags,
  categoryName,
  allTags,
  categoryId,
}: {
  className?: string
  tags: {
    id: string
    name: string
    storeId: string
    createdAt: string
  }[]
  categoryName: string
  allTags: {
    id: string
    name: string
    storeId: string
    createdAt: string
  }[]
  categoryId: string
}) {
  const [selectedTags, setSelectedTags] = React.useState<Option[]>(
    tags.map(tag => ({
      id: tag.id,
      value: tag.name,
      label: tag.name,
    })) ?? [],
  )
  const fetcher = useFetcher({ key: 'updateCategory' })
  const isPending =
    fetcher.state === 'submitting' || fetcher.state === 'loading'

  return (
    <fetcher.Form
      method="post"
      action="?/updateCategory"
      className={cn('grid items-start gap-2', className)}
    >
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="name" className="text-left">
          Nome
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="Camisetas"
          className="col-span-3 text-base sm:text-sm"
          defaultValue={categoryName}
        />
      </div>
      <h2 className="text-sm font-medium text-gray-600">Tags relacionadas</h2>
      <MultipleSelector
        value={selectedTags}
        onChange={setSelectedTags}
        defaultOptions={allTags.map(tag => ({
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
      <input type="hidden" name="categoryId" value={categoryId} />
      <Button2 status={isPending ? 'pending' : 'idle'} type="submit">
        Salvar
      </Button2>
    </fetcher.Form>
  )
}
