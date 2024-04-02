import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import { LogOutIcon } from "lucide-react";

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
  }, [fetcher.data, setIsDialogOpen]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-x-2 p-2 text-sm font-semibold text-gray-500 transition-all hover:bg-gray-100"
        >
          <LogOutIcon className="h-4 w-4" />
          <p>Log out</p>
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[350px]">
        <DialogHeader>
          <DialogTitle>Are you sure you want to log out?</DialogTitle>
        </DialogHeader>

        <fetcher.Form method="post" action="/logout">
          <DialogFooter className="mt-8 flex lg:space-x-6">
            <button
              onClick={() => {
                setIsDialogOpen(false);
              }}
              type="button"
              className="text-sm text-gray-500"
            >
              Cancel
            </button>
            <Button type="submit" name="action" value="logout">
              Log out
            </Button>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}
