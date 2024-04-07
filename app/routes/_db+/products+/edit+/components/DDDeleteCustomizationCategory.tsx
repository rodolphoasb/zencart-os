"use client";

import * as React from "react";
import { Form } from "@remix-run/react";
import { useMediaQuery } from "@uidotdev/usehooks";
import { Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Button2 } from "~/components/ui/button2";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { cn } from "~/utils";

export function DDDeleteCustomizationCategory({
  customizationCategoryId,
}: {
  customizationCategoryId: number;
}) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("only screen and (min-width : 768px)");

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
            <DialogTitle>Delete customization category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this customization category?
            </DialogDescription>
          </DialogHeader>
          <DeleteForm customizationCategoryId={customizationCategoryId} />
        </DialogContent>
      </Dialog>
    );
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
          <DrawerTitle>Delete customization category</DrawerTitle>
          <DrawerDescription>
            Are you sure you want to delete this customization category?
          </DrawerDescription>
        </DrawerHeader>
        <DeleteForm
          customizationCategoryId={customizationCategoryId}
          className="px-4"
        />
      </DrawerContent>
    </Drawer>
  );
}

function DeleteForm({
  className,
  customizationCategoryId,
}: {
  className?: string;
  customizationCategoryId: number;
}) {
  return (
    <Form
      action="?/deleteCustomizationCategory"
      method="post"
      className={cn("grid items-start gap-4", className)}
      navigate={false}
    >
      <div className="mt-8 flex justify-end gap-x-4">
        <input
          type="hidden"
          name="customizationCategoryId"
          value={customizationCategoryId}
        />

        <DrawerClose asChild>
          <Button variant="link" className="w-fit">
            Cancel
          </Button>
        </DrawerClose>

        <Button2 type="submit" color="red" className="w-fit">
          Delete
        </Button2>
      </div>
    </Form>
  );
}
