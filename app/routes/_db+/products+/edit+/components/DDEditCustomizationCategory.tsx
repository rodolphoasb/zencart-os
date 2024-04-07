"use client";

import * as React from "react";
import { useFetcher } from "@remix-run/react";
import { useMediaQuery } from "@uidotdev/usehooks";
import { Edit } from "lucide-react";
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
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/utils";
import type { loader } from "../$productId";

export function DDEditCustomizationCategory({
  customizationCategoryId,
  customizationName,
  customizationMin,
  customizationMax,
}: {
  customizationCategoryId: number;
  customizationName: string;
  customizationMin: number;
  customizationMax: number;
}) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("only screen and (min-width : 768px)");
  const fetcher = useFetcher<typeof loader>({
    key: "editCustomizationCategory",
  });
  const isPending =
    fetcher.state === "submitting" || fetcher.state === "loading";

  React.useEffect(() => {
    if (isPending === false && fetcher.data?.ok) {
      setOpen(false);
    }
  }, [fetcher.data, isPending]);

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
            <DialogTitle>Create customization</DialogTitle>
            <DialogDescription>
              This is the space for you to make changes to your store&#39;s
              layout.
            </DialogDescription>
          </DialogHeader>
          <StylesForm
            customizationName={customizationName}
            customizationMin={customizationMin}
            customizationMax={customizationMax}
            customizationCategoryId={customizationCategoryId}
          />
        </DialogContent>
      </Dialog>
    );
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
          <DrawerTitle>Create customization</DrawerTitle>
          <DrawerDescription>
            This is the space for you to make changes to your store&#39;s
            layout.
          </DrawerDescription>
        </DrawerHeader>
        <StylesForm
          customizationName={customizationName}
          customizationMin={customizationMin}
          customizationMax={customizationMax}
          customizationCategoryId={customizationCategoryId}
          className="px-4"
        />
      </DrawerContent>
    </Drawer>
  );
}

function StylesForm({
  className,
  customizationCategoryId,
  customizationName,
  customizationMin,
  customizationMax,
}: {
  className?: string;
  customizationCategoryId: number;
  customizationName: string;
  customizationMin: number;
  customizationMax: number;
}) {
  const fetcher = useFetcher({ key: "editCustomizationCategory" });
  const isPending =
    fetcher.state === "submitting" || fetcher.state === "loading";

  return (
    <fetcher.Form
      method="post"
      action="?/editCustomizationCategory"
      className={cn("grid items-start gap-2", className)}
    >
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="customizationName" className="text-left">
          Name
        </Label>
        <Input
          id="customizationName"
          name="customizationName"
          placeholder="E.g.: Size"
          className="col-span-3 text-base sm:text-sm"
          defaultValue={customizationName}
        />
      </div>
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="customizationMin" className="text-left">
          Minimum
        </Label>
        <Input
          id="customizationMin"
          name="customizationMin"
          placeholder="E.g.: 1"
          className="col-span-3 text-base sm:text-sm"
          type="number"
          defaultValue={customizationMin}
        />
      </div>
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="customizationMax" className="text-left">
          Maximum
        </Label>
        <Input
          id="customizationMax"
          name="customizationMax"
          placeholder="E.g.: 10"
          className="col-span-3 text-base sm:text-sm"
          type="number"
          defaultValue={customizationMax}
        />
      </div>
      <input
        type="hidden"
        name="customizationCategoryId"
        value={customizationCategoryId}
      />
      <Button2 status={isPending ? "pending" : "idle"} type="submit">
        Save
      </Button2>
    </fetcher.Form>
  );
}
