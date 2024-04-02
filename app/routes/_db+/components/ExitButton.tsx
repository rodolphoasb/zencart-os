import { useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import { LogOutIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

export function ExitButton({
  isDialogOpen,
  setIsDialogOpen,
}: {
  isDialogOpen: boolean;
  setIsDialogOpen: (value: boolean) => void;
}) {
  const fetcher = useFetcher();

  useEffect(() => {
    if (fetcher.data) {
      setIsDialogOpen(false);
    }
  }, [fetcher.data]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-x-2 p-2 text-sm font-semibold text-gray-500 transition-all hover:bg-gray-100"
        >
          <LogOutIcon className="h-4 w-4" />
          <p>Sair</p>
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[350px]">
        <DialogHeader>
          <DialogTitle>Ter certeza que deseja sair?</DialogTitle>
        </DialogHeader>

        <fetcher.Form method="post" action="/api/signout?index">
          <DialogFooter className="mt-8 flex lg:space-x-6">
            <button
              onClick={() => {
                setIsDialogOpen(false);
              }}
              type="button"
              className="text-sm text-gray-500"
            >
              Cancelar
            </button>
            <Button type="submit" name="action" value="logout">
              Sair
            </Button>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}
