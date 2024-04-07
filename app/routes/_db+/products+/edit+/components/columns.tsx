"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ClientOnly } from "remix-utils/client-only";
import { DDAddOrDeleteCustomizationItem } from "./DDAddOrDeleteCustomizationItem";
import { DDDeleteCustomizationCategory } from "./DDDeleteCustomizationCategory";
import { DDEditCustomizationCategory } from "./DDEditCustomizationCategory";

export type CustomizationCategory = {
  id: number;
  name: string;
  min: number;
  max: number;
  itemId: string;
  itemCustomizations: {
    id: number;
    name: string;
    price: number;
    createdAt: string;
    updatedAt: string;
    orderItemId: number | null;
    customizationCategoryId: number;
  }[];
};

export const columns: ColumnDef<CustomizationCategory>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "min",
    header: "Minimum",
  },
  {
    accessorKey: "max",
    header: "Maximum",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const customization = row.original;

      return (
        <div className="flex w-full justify-end gap-x-2">
          <ClientOnly>
            {() => (
              <DDAddOrDeleteCustomizationItem
                customizationCategoryId={customization.id}
                customizationItems={customization.itemCustomizations}
              />
            )}
          </ClientOnly>
          <ClientOnly>
            {() => (
              <DDEditCustomizationCategory
                customizationCategoryId={customization.id}
                customizationName={customization.name}
                customizationMin={customization.min}
                customizationMax={customization.max}
              />
            )}
          </ClientOnly>
          <ClientOnly>
            {() => (
              <DDDeleteCustomizationCategory
                customizationCategoryId={customization.id}
              />
            )}
          </ClientOnly>
        </div>
      );
    },
  },
];
