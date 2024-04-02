'use client'

import { Link } from '@remix-run/react'
import type { ColumnDef } from '@tanstack/react-table'
import { Edit } from 'lucide-react'
import { ClientOnly } from 'remix-utils/client-only'
import { DrawerDialogDeleteProduct } from './DrawerDialogDeleteProduct'

export type Product = {
  id: string
  name: string
  isAvailable: boolean
  isVisible: boolean
  tags: {
    id: string
    name: string
    storeId: string
    createdAt: string
  }[]
}

export const columns: ColumnDef<Product>[] = [
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
                className="inline-flex items-center whitespace-nowrap rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-600/20"
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
    accessorKey: 'isAvailable',
    header: 'Disponível',
    cell: ({ row }) => {
      const product = row.original

      return product.isAvailable ? (
        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
          Sim
        </span>
      ) : (
        <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
          Não
        </span>
      )
    },
  },
  {
    accessorKey: 'isVisible',
    header: 'Visível',
    cell: ({ row }) => {
      const product = row.original

      return product.isVisible ? (
        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
          Sim
        </span>
      ) : (
        <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
          Não
        </span>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const product = row.original

      return (
        <div className="flex w-full justify-end gap-x-2">
          <Link to={`/products/edit/${product.id}`}>
            <button className="flex h-11 w-11 items-center justify-center gap-x-2 rounded-lg text-sm text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-700">
              <Edit className="h-4 w-4" />
            </button>
          </Link>
          <ClientOnly>
            {() => <DrawerDialogDeleteProduct productId={product.id} />}
          </ClientOnly>
        </div>
      )
    },
  },
]
