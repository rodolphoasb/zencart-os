'use client'

import * as React from 'react'
import { parseWithZod } from '@conform-to/zod'
import { useFetcher } from '@remix-run/react'
import { useMediaQuery } from '@uidotdev/usehooks'
import { PenSquare } from 'lucide-react'
import { Button } from '~/components/ui/button'
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
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Switch } from '~/components/ui/switch'
import { cn } from '~/utils'
import { type loader, unitSchema } from '../_index/route'

export function DrawerDialogEditUnit({
  name,
  businessHours,
  address,
  unitId,
  typeOfDelivery,
  cep,
  phone,
}: {
  name: string
  address: string
  unitId: number
  typeOfDelivery: string
  phone: string
  cep: string
  businessHours: {
    id: number
    day: string
    open: string
    close: string
    unitId: number
  }[]
}) {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery('only screen and (min-width : 768px)')
  const fetcher = useFetcher<typeof loader>({ key: 'updateUnit' })
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
          <Button
            className="flex items-center justify-center rounded-lg text-xs text-gray-500 hover:bg-gray-50"
            variant={'link'}
          >
            <PenSquare className="h-4 w-4 text-gray-400" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[500px] max-w-max overflow-y-scroll">
          <DialogHeader>
            <DialogTitle>Editar unidade</DialogTitle>
            <DialogDescription>
              Esse é o espaço para você alterar as informações da sua unidade.
            </DialogDescription>
          </DialogHeader>
          <EditUnitForm
            unitId={unitId}
            name={name}
            businessHours={businessHours}
            typeOfDelivery={typeOfDelivery}
            address={address}
            phone={phone}
            cep={cep}
          />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          className="w-full gap-x-2 text-xs text-gray-500"
          variant={'outline'}
        >
          <PenSquare className="h-4 w-4 text-gray-400" />
          <p>Editar</p>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Editar unidade</DrawerTitle>
          <DrawerDescription>
            Esse é o espaço para você alterar as informações da sua unidade.
          </DrawerDescription>
        </DrawerHeader>
        <EditUnitForm
          unitId={unitId}
          name={name}
          businessHours={businessHours}
          typeOfDelivery={typeOfDelivery}
          className="px-4 pb-8"
          address={address}
          phone={phone}
          cep={cep}
        />
      </DrawerContent>
    </Drawer>
  )
}

type DayHours = {
  open: boolean
  from: string
  to: string
}

type WeeklyHours = {
  [day: string]: DayHours
}

const defaultHours: WeeklyHours = {
  Domingo: { open: false, from: '9:00', to: '17:00' },
  Segunda: { open: true, from: '9:00', to: '17:00' },
  Terça: { open: true, from: '9:00', to: '17:00' },
  Quarta: { open: true, from: '9:00', to: '17:00' },
  Quinta: { open: true, from: '9:00', to: '17:00' },
  Sexta: { open: true, from: '9:00', to: '17:00' },
  Sábado: { open: false, from: '9:00', to: '17:00' },
}

// Time range array from 00:00 to 23:30
const timeRange = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2)
  const minute = i % 2 === 0 ? '00' : '30'
  return `${hour}:${minute}`
})

function EditUnitForm({
  unitId,
  name,
  address,
  typeOfDelivery,
  businessHours,
  className,
  phone,
  cep,
}: {
  className?: string
  unitId: number
  name: string
  address: string
  typeOfDelivery: string
  phone: string
  cep: string
  businessHours: {
    id: number
    day: string
    open: string
    close: string
    unitId: number
  }[]
}) {
  const fetcher = useFetcher({ key: 'updateUnit' })
  const isPending =
    fetcher.state === 'submitting' || fetcher.state === 'loading'
  const [weeklyHours, setWeeklyHours] = React.useState<WeeklyHours>(
    transformToWeeklyHours(businessHours) ?? defaultHours,
  )
  const [deliveryType, setDeliveryType] = React.useState<
    'onlyDelivery' | 'onlyPickup' | 'deliveryAndPickup'
  >(
    (typeOfDelivery as 'deliveryAndPickup' | 'onlyDelivery' | 'onlyPickup') ??
      'deliveryAndPickup',
  )
  const [formStep, setFormStep] = React.useState<'0' | '1' | '2'>('0')
  const isDesktop = useMediaQuery('only screen and (min-width : 768px)')
  // Form states
  const [unitName, setUnitName] = React.useState(name ?? '')
  const [unitCep, setUnitCep] = React.useState(cep ?? '')
  const [unitAddress, setUnitAddress] = React.useState(address ?? '')
  const [unitPhone, setUnitPhone] = React.useState(phone ?? '')

  function handleToggleDay(day: string) {
    setWeeklyHours({
      ...weeklyHours,
      [day]: { ...weeklyHours[day], open: !weeklyHours[day].open },
    })
  }

  function handleChangeTime({
    day,
    from,
    to,
  }: {
    day: string
    from: string
    to: string
  }) {
    setWeeklyHours({
      ...weeklyHours,
      [day]: { ...weeklyHours[day], from, to },
    })
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const formData = new FormData()
    formData.append('typeOfDelivery', deliveryType)
    formData.append('businessHours', JSON.stringify(weeklyHours))
    formData.append('name', unitName)
    formData.append('cep', unitCep)
    formData.append('address', unitAddress)
    formData.append('phone', unitPhone)
    formData.append('unitId', unitId.toString())
    const submission = parseWithZod(formData, { schema: unitSchema })

    if (submission.status !== 'success') {
      return submission.reply()
    }

    fetcher.submit(formData, {
      action: '?/updateUnit',
      method: 'post',
    })
  }

  // Function to add mask to phone number
  function applyMask(phoneNumber: string) {
    return phoneNumber
      .replace(/\D/g, '') // Remove all non-numeric characters
      .replace(/^(\d{2})(\d)/g, '($1) $2') // Add parentheses around the area code
      .replace(/(\d)(\d{4})$/, '$1-$2') // Add dash before the last 4 digits
  }

  // Handle changes in the input field
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const maskedValue = applyMask(event.target.value)
    setUnitPhone(maskedValue) // Propagate the change up with the masked value
  }

  function applyCepMask(cep: string) {
    return cep
      .replace(/\D/g, '') // Remove non-numeric characters
      .replace(/^(\d{5})(\d)/, '$1-$2') // Apply mask
  }

  // Handle changes in the input
  function handleCepChange(event: React.ChangeEvent<HTMLInputElement>) {
    const maskedValue = applyCepMask(event.target.value)
    setUnitCep(maskedValue) // Propagate the change up with the masked value
  }

  function renderStepContent(step: '0' | '1' | '2') {
    switch (step) {
      case '0':
        return (
          <>
            {/* Basic Information */}
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="name" className="text-left">
                Nome
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Ex: Unidade"
                className="col-span-3 text-base"
                value={unitName}
                onChange={e => setUnitName(e.target.value)}
              />
              <Label htmlFor="cep" className="text-left">
                CEP
              </Label>
              <Input
                id="cep"
                name="cep"
                placeholder="Ex: 00000-000"
                className="col-span-3 text-base"
                value={applyCepMask(unitCep)}
                onChange={handleCepChange}
                maxLength={9}
              />
              <Label htmlFor="address" className="text-left">
                Endereço
              </Label>
              <Input
                id="address"
                name="address"
                placeholder="Ex: Rua do sucesso, 123"
                className="col-span-3 text-base"
                value={unitAddress}
                onChange={e => setUnitAddress(e.target.value)}
              />
              <Label htmlFor="phone" className="text-left">
                Telefone
              </Label>
              <Input
                id="phone"
                name="phone"
                placeholder="Ex: (11) 99999-9999"
                className="col-span-3 text-base"
                value={applyMask(phone)}
                onChange={handleChange}
                maxLength={15}
              />
            </div>
          </>
        )
      case '1':
        return (
          <>
            {/* Opening Hours */}
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="openingHours" className="text-left">
                Horário de funcionamento
              </Label>
              <div className="mt-2 flex flex-col gap-y-4">
                {isDesktop
                  ? Object.keys(weeklyHours).map(day => (
                      <div
                        className="flex min-h-12 items-center gap-x-3"
                        key={day}
                      >
                        <label className="min-w-28 text-sm text-gray-700">
                          {day}
                        </label>
                        <div className="flex gap-x-2">
                          <p className="text-sm text-gray-500">
                            {weeklyHours[day].open ? 'Aberto' : 'Fechado'}
                          </p>
                          <Switch
                            checked={weeklyHours[day].open}
                            onCheckedChange={() => handleToggleDay(day)}
                          />
                        </div>
                        {weeklyHours[day].open && (
                          <div className="flex items-center gap-x-4">
                            <Select
                              value={weeklyHours[day].from}
                              onValueChange={value =>
                                handleChangeTime({
                                  day,
                                  from: value,
                                  to: weeklyHours[day].to,
                                })
                              }
                            >
                              <SelectTrigger className="w-[100px]">
                                <SelectValue
                                  aria-label={weeklyHours[day].from}
                                  placeholder="Selecione a origem"
                                >
                                  {weeklyHours[day].from}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup className="max-h-48 overflow-y-scroll">
                                  {timeRange.map(time => (
                                    <SelectItem key={time} value={time}>
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                            até
                            <Select
                              value={weeklyHours[day].to}
                              onValueChange={value =>
                                handleChangeTime({
                                  day,
                                  from: weeklyHours[day].from,
                                  to: value,
                                })
                              }
                            >
                              <SelectTrigger className="w-[100px]">
                                <SelectValue
                                  aria-label={weeklyHours[day].to}
                                  placeholder="Selecione o destino"
                                >
                                  {weeklyHours[day].to}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup className="max-h-48 overflow-y-scroll">
                                  {timeRange.map(time => (
                                    <SelectItem key={time} value={time}>
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    ))
                  : Object.keys(weeklyHours).map(day => (
                      <div
                        className="flex min-h-12 flex-col items-start gap-y-2 rounded-lg border p-2"
                        key={day}
                      >
                        <div className="flex w-full items-center justify-between">
                          <label className="">{day}</label>
                          <div className="flex gap-x-2">
                            <p className="text-sm text-gray-500">
                              {weeklyHours[day].open ? 'Aberto' : 'Fechado'}
                            </p>
                            <Switch
                              checked={weeklyHours[day].open}
                              onCheckedChange={() => handleToggleDay(day)}
                            />
                          </div>
                        </div>
                        {weeklyHours[day].open && (
                          <div className="flex items-center gap-x-4">
                            <Select
                              value={weeklyHours[day].from}
                              onValueChange={value =>
                                handleChangeTime({
                                  day,
                                  from: value,
                                  to: weeklyHours[day].to,
                                })
                              }
                            >
                              <SelectTrigger className="w-[100px]">
                                <SelectValue
                                  aria-label={weeklyHours[day].from}
                                  placeholder="Selecione a origem"
                                >
                                  {weeklyHours[day].from}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup className="max-h-48 overflow-y-scroll">
                                  {timeRange.map(time => (
                                    <SelectItem key={time} value={time}>
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                            até
                            <Select
                              value={weeklyHours[day].to}
                              onValueChange={value =>
                                handleChangeTime({
                                  day,
                                  from: weeklyHours[day].from,
                                  to: value,
                                })
                              }
                            >
                              <SelectTrigger className="w-[100px]">
                                <SelectValue
                                  aria-label={weeklyHours[day].to}
                                  placeholder="Selecione o destino"
                                >
                                  {weeklyHours[day].to}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup className="max-h-48 overflow-y-scroll">
                                  {timeRange.map(time => (
                                    <SelectItem key={time} value={time}>
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    ))}
              </div>
            </div>
          </>
        )
      case '2':
        return (
          <>
            <div>
              <Label htmlFor="openingHours" className="text-left">
                Dados da entrega
              </Label>
              <RadioGroup
                className="mt-2 flex flex-col gap-y-4 sm:flex-row sm:gap-x-4 sm:gap-y-0"
                defaultValue={deliveryType}
                value={deliveryType}
                onValueChange={value =>
                  setDeliveryType(
                    value as
                      | 'onlyDelivery'
                      | 'onlyPickup'
                      | 'deliveryAndPickup',
                  )
                }
              >
                <Label
                  htmlFor="deliveryAndPickup"
                  className="relative flex items-center space-x-6 rounded-md border p-4"
                >
                  <RadioGroupItem
                    className="text-orange-500"
                    value="deliveryAndPickup"
                    id="deliveryAndPickup"
                  />
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-xs font-medium text-zinc-600">
                      Entrega e Retirada
                    </p>
                  </div>
                </Label>
                <Label
                  htmlFor="onlyDelivery"
                  className="relative flex items-center space-x-6 rounded-md border p-4"
                >
                  <RadioGroupItem
                    className="text-orange-500"
                    value="onlyDelivery"
                    id="onlyDelivery"
                  />
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-xs font-medium text-zinc-600">
                      Só entrega
                    </p>
                  </div>
                </Label>
                <Label
                  htmlFor="onlyPickup"
                  className="relative flex items-center space-x-6 rounded-md border p-4"
                >
                  <RadioGroupItem
                    className="text-orange-500"
                    value="onlyPickup"
                    id="onlyPickup"
                  />
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-xs font-medium text-zinc-600">
                      Só retirada
                    </p>
                  </div>
                </Label>
              </RadioGroup>
            </div>
          </>
        )
      default:
        return null
    }
  }

  return (
    <form
      className={cn('grid items-start gap-4', className)}
      onSubmit={handleSubmit}
    >
      {renderStepContent(formStep)}

      <div className="flex items-center justify-between sm:mt-8">
        {/* Navigation Buttons */}
        {formStep !== '0' && (
          <button
            className="flex items-center text-sm text-gray-800"
            type="button"
            onClick={() =>
              setFormStep(
                prevStep =>
                  (parseInt(prevStep) - 1).toString() as '0' | '1' | '2',
              )
            }
          >
            Voltar
          </button>
        )}
        {formStep !== '2' ? (
          <Button
            variant={`outline`}
            type="button"
            onClick={() =>
              setFormStep(
                prevStep =>
                  (parseInt(prevStep) + 1).toString() as '0' | '1' | '2',
              )
            }
          >
            Continuar
          </Button>
        ) : (
          <Button2
            status={isPending ? 'pending' : 'idle'}
            type="submit"
            className={`w-fit`}
          >
            Salvar alterações
          </Button2>
        )}
      </div>
    </form>
  )
}

const transformToWeeklyHours = (
  hoursArray: {
    id: number
    day: string
    open: string
    close: string
    unitId: number
  }[],
): WeeklyHours => {
  const weeklyHours: WeeklyHours = {}

  hoursArray.forEach(({ day, open, close }) => {
    weeklyHours[day] = {
      open: open !== 'closed',
      from: open !== 'closed' ? open : '9:00', // Assuming default 'from' time as '9:00' for closed days
      to: close !== 'closed' ? close : '17:00', // Assuming default 'to' time as '17:00' for closed days
    }
  })

  return weeklyHours
}
