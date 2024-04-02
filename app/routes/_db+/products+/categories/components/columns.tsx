'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { ClientOnly } from 'remix-utils/client-only'
import { DrawerDialogDeleteCategory } from './DrawerDialogDeleteCategory'
import { DrawerDialogEditCategory } from './DrawerDialogEditCategory'

export type Category = {
  id: string
  name: string
  tags: {
    id: string
    name: string
    storeId: string
    createdAt: string
  }[]
}

export const columns: ColumnDef<Category>[] = [
  {
    accessorKey: 'name',
    header: 'Nome',
  },
  {
    accessorKey: 'tags',
    header: 'Tags',
    cell: ({ row }) => {
      const data = row.original

      return (
        <div className="flex gap-x-2">
          {data.tags.map(tag => {
            return (
              <span
                key={tag.id}
                className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-600/20"
              >
                {tag.name}
              </span>
            )
          })}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const category = row.original

      return (
        <div className="flex w-full justify-end gap-x-2">
          <ClientOnly>
            {() => (
              <DrawerDialogEditCategory
                categoryName={category.name}
                categoryId={category.id}
                tags={category.tags}
              />
            )}
          </ClientOnly>
          <ClientOnly>
            {() => <DrawerDialogDeleteCategory categoryId={category.id} />}
          </ClientOnly>
        </div>
      )
    },
  },
]
