'use client'

import { type ChangeEvent, useEffect, useState } from 'react'
import { Stream } from '@cloudflare/stream-react'
import { useFetcher } from '@remix-run/react'
import { useMediaQuery } from '@uidotdev/usehooks'
import posthog from 'posthog-js'
import { Button2 } from '~/components/ui/button2'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '~/components/ui/drawer'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { cn } from '~/utils'
import type { action } from '../route'

export function DrawerDialogWatchVideo() {
  const [open, setOpen] = useState(false)
  const isDesktop = useMediaQuery('only screen and (min-width : 768px)')
  const fetcher = useFetcher<typeof action>({ key: 'create-lead' })
  const isPending =
    fetcher.state === 'submitting' || fetcher.state === 'loading'
  const [shouldShowVideo, setShouldShowVideo] = useState(false)

  useEffect(() => {
    if (isPending === false && fetcher.data?.ok) {
      setShouldShowVideo(true)
    }
  }, [fetcher.data, isPending])

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button2
            className="flex h-12 cursor-pointer items-center justify-center gap-x-2 rounded-lg border px-4 shadow"
            color="white"
            onClick={() => {
              posthog.capture('clicked_watch_video')
            }}
          >
            <svg
              aria-hidden="true"
              className="h-3 w-3 flex-none fill-orange-600 group-active:fill-current"
            >
              <path d="m9.997 6.91-7.583 3.447A1 1 0 0 1 1 9.447V2.553a1 1 0 0 1 1.414-.91L9.997 5.09c.782.355.782 1.465 0 1.82Z" />
            </svg>
            <span className="ml-3">Ver vídeo demonstração</span>
          </Button2>
        </DialogTrigger>
        <DialogContent
          className={shouldShowVideo ? 'sm:max-w-[725px]' : 'sm:max-w-[425px]'}
        >
          <DialogHeader>
            <DialogTitle>
              {shouldShowVideo ? 'Como funciona' : 'Digite seus dados'}
            </DialogTitle>
          </DialogHeader>
          {shouldShowVideo ? (
            <div id="video" className="mt-6 flex w-full justify-center">
              <div className="w-full overflow-hidden rounded-lg">
                <Stream controls src={'cda6efbbf4814e7830b47cd077641c56'} />
              </div>
            </div>
          ) : (
            <WatchVideoForm />
          )}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button2
          className="flex h-12 cursor-pointer items-center justify-center gap-x-2 rounded-lg border px-4 shadow"
          color="white"
          onClick={() => {
            posthog.capture('clicked_watch_video')
          }}
        >
          <svg
            aria-hidden="true"
            className="h-3 w-3 flex-none fill-orange-600 group-active:fill-current"
          >
            <path d="m9.997 6.91-7.583 3.447A1 1 0 0 1 1 9.447V2.553a1 1 0 0 1 1.414-.91L9.997 5.09c.782.355.782 1.465 0 1.82Z" />
          </svg>
          <span className="ml-3">Ver vídeo demonstração</span>
        </Button2>
      </DrawerTrigger>
      <DrawerContent onOpenAutoFocus={e => e.preventDefault()}>
        <DrawerHeader className="text-left">
          <DrawerTitle>
            {shouldShowVideo ? 'Como funciona' : 'Digite seus dados'}
          </DrawerTitle>
        </DrawerHeader>
        {shouldShowVideo ? (
          <div id="video" className="mb-12 mt-6 flex w-full justify-center">
            <div className="w-full overflow-hidden rounded-lg ">
              <Stream controls src={'cda6efbbf4814e7830b47cd077641c56'} />
            </div>
          </div>
        ) : (
          <WatchVideoForm className="px-4 pb-8" />
        )}
      </DrawerContent>
    </Drawer>
  )
}

function WatchVideoForm({ className }: { className?: string }) {
  const [phone, setPhone] = useState('')

  const fetcher = useFetcher({ key: 'create-lead' })
  const isPending =
    fetcher.state === 'submitting' || fetcher.state === 'loading'

  // Function to add mask to phone number
  function applyMask(phoneNumber: string) {
    return phoneNumber
      .replace(/\D/g, '') // Remove all non-numeric characters
      .replace(/^(\d{2})(\d)/g, '($1) $2') // Add parentheses around the area code
      .replace(/(\d)(\d{4})$/, '$1-$2') // Add dash before the last 4 digits
  }

  // Handle changes in the input field
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const maskedValue = applyMask(event.target.value)
    setPhone(maskedValue) // Propagate the change up with the masked value
  }

  return (
    <fetcher.Form
      method="post"
      className={cn('grid items-start gap-4', className)}
    >
      <div className="mt-8 flex flex-col justify-end gap-4">
        <div className="flex flex-col gap-y-2">
          <Label htmlFor="name" className="text-left">
            Nome
          </Label>
          <Input
            id="name"
            name="name"
            placeholder="Digite seu nome aqui"
            className="col-span-3 text-base sm:text-sm"
          />
        </div>
        <div className="flex flex-col gap-y-2">
          <Label htmlFor="phoneNumber" className="text-left">
            Telefone
          </Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            placeholder="Ex: (11) 99999-9999"
            className="col-span-3 text-base"
            value={applyMask(phone)}
            onChange={handleChange}
            maxLength={15}
          />
        </div>

        <Button2
          status={isPending ? 'pending' : 'idle'}
          type="submit"
          className="w-full"
        >
          Continuar
        </Button2>
      </div>
    </fetcher.Form>
  )
}
