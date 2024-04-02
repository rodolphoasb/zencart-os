"use client";

import * as React from "react";
import { useFetcher } from "@remix-run/react";
// import {
//   DropZone,
//   FileTrigger,
//   Text,
//   Button as ReactAriaButton,
// } from "react-aria-components";
// import type { FileDropItem } from "react-aria";
import { useMediaQuery } from "@uidotdev/usehooks";
import { Columns, Rows } from "lucide-react";
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
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { cn } from "~/utils";

export function DrawerDialogStyles({
  layoutType,
}: {
  layoutType: "VERTICAL" | "HORIZONTAL";
}) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("only screen and (min-width : 768px)");
  const fetcher = useFetcher({ key: "changeStoreStyles" });

  React.useEffect(() => {
    if ((fetcher.data as { ok: boolean })?.ok) {
      setOpen(false);
    }
  }, [fetcher.data]);

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full text-xs text-gray-500" variant={"link"}>
            + Estilos
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar estilos</DialogTitle>
            <DialogDescription>
              Esse é o espaço para você fazer alterações no layout da sua loja.
            </DialogDescription>
          </DialogHeader>
          <StylesForm layoutType={layoutType} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="w-full text-xs text-gray-500" variant={"link"}>
          + Estilos
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Editar estilos</DrawerTitle>
          <DrawerDescription>
            Esse é o espaço para você fazer alterações no layout da sua loja.
          </DrawerDescription>
        </DrawerHeader>
        <StylesForm layoutType={layoutType} className="px-4" />
      </DrawerContent>
    </Drawer>
  );
}

function StylesForm({
  className,
  layoutType: layoutTypeValue,
}: {
  className?: string;
  layoutType: "HORIZONTAL" | "VERTICAL";
}) {
  const [layoutType, setLayoutType] = React.useState<"HORIZONTAL" | "VERTICAL">(
    layoutTypeValue,
  );
  const fetcher = useFetcher({ key: "changeStoreStyles" });
  const isPending =
    fetcher.state === "loading" || fetcher.state === "submitting";

  // const [color, setColor] = React.useState("#aabbcc");
  // const [headerFile, setHeaderFile] = React.useState<File | null>(null);
  // const [filePreviewUrl, setFilePreviewUrl] = React.useState<string | null>(
  //   null,
  // );

  // React.useEffect(() => {
  //   // Cleanup URL.createObjectURL
  //   return () => {
  //     if (filePreviewUrl) {
  //       URL.revokeObjectURL(filePreviewUrl);
  //     }
  //   };
  // }, [filePreviewUrl]);

  // const renderFilePreview = () => {
  //   if (!headerFile) return null;

  //   const deleteFile = () => {
  //     // Revoke the object URL to free up resources
  //     if (filePreviewUrl) {
  //       URL.revokeObjectURL(filePreviewUrl);
  //       setFilePreviewUrl(null);
  //     }
  //     // Clear the file state
  //     setHeaderFile(null);
  //   };

  //   return (
  //     <div className="group relative mt-2 h-20 w-20 overflow-hidden rounded-md">
  //       <img
  //         className="h-full w-full"
  //         src={filePreviewUrl as string}
  //         alt="preview"
  //       />
  //       <button
  //         onClick={deleteFile}
  //         className="absolute -right-2 -top-2 z-10 rounded-full bg-gray-100 p-1 group-hover:block lg:hidden"
  //       >
  //         <XIcon />
  //       </button>
  //     </div>
  //   );
  // };

  return (
    <form
      action="?/changeStoreStyles"
      method="post"
      className={cn("grid items-start gap-4", className)}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const form = e.currentTarget;
        const formData = new FormData(form);

        fetcher.submit(formData, {
          action: "?/changeStoreStyles",
          method: "post",
        });
      }}
    >
      <input type="hidden" name="layoutType" value={layoutType} />
      {/* <div>
        <h2 className="text-sm font-medium text-gray-600">Imagem de capa</h2>
        <DropZone
          getDropOperation={(types) => {
            return types.has("image/png") || types.has("image/jpeg")
              ? "copy"
              : "cancel";
          }}
          onDrop={async (e) => {
            const file = e.items.filter(
              (file) => file.kind === "file",
            ) as FileDropItem[];
            const firstFile = await file[0].getFile();
            setHeaderFile(firstFile);

            if (file) {
              setFilePreviewUrl(URL.createObjectURL(firstFile));
            }
          }}
          className={`mt-2 flex h-[55px] items-center rounded-md border border-dashed`}
        >
          <Text className="mr-4 p-2 text-sm text-zinc-500" slot="label">
            Arraste e solte o arquivo aqui ou:
          </Text>
          <FileTrigger
            onSelect={(e) => {
              const file = e?.item(0);
              if (file) {
                setHeaderFile(file);
                setFilePreviewUrl(URL.createObjectURL(file));
              }
            }}
            allowsMultiple={false}
            acceptedFileTypes={["image/png", "image/jpeg"]}
          >
            <ReactAriaButton
              className={`ml-auto flex h-full items-center border border-zinc-100 bg-zinc-50 p-2 text-xs text-zinc-500 hover:bg-zinc-100`}
            >
              Selecione arquivo
            </ReactAriaButton>
          </FileTrigger>
        </DropZone>

        {renderFilePreview()}
      </div>
      <div>
        <h2 className="text-sm font-medium text-gray-600">
          Cor de sobreposição da imagem de capa
        </h2>
      </div> */}
      <div>
        <h2 className="text-sm font-medium text-gray-600">
          Layout do catálogo
        </h2>

        <RadioGroup
          className="mt-2 flex gap-x-4"
          defaultValue={layoutType}
          value={layoutType}
          onValueChange={(value) =>
            setLayoutType(value as "HORIZONTAL" | "VERTICAL")
          }
        >
          <Label
            htmlFor="VERTICAL"
            className="relative flex items-center space-x-6 rounded-md border p-4"
          >
            <RadioGroupItem
              className="absolute left-2 top-2 text-orange-500"
              value="VERTICAL"
              id="VERTICAL"
            />
            <div className="flex flex-col items-center justify-center gap-y-2">
              <Rows className="h-6 w-6 text-orange-500" />
              <p className="text-xs font-medium text-zinc-600">Vertical</p>
            </div>
          </Label>
          <Label
            htmlFor="HORIZONTAL"
            className="relative flex items-center space-x-6 rounded-md border p-4"
          >
            <RadioGroupItem
              className="absolute left-2 top-2 text-orange-500"
              value="HORIZONTAL"
              id="HORIZONTAL"
            />
            <div className="flex flex-col items-center justify-center gap-y-2">
              <Columns className="h-6 w-6 text-orange-500" />
              <p className="text-xs font-medium text-zinc-600">Horizontal</p>
            </div>
          </Label>
        </RadioGroup>
      </div>
      <Button2
        status={isPending ? "pending" : "idle"}
        type="submit"
        className={`mt-8 w-fit`}
      >
        Salvar
      </Button2>
    </form>
  );
}
