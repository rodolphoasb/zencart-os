import { InfoIcon, Store, Wallet } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion'
import { Drawer, DrawerContent, DrawerTrigger } from '~/components/ui/drawer'
import { ScrollArea } from '~/components/ui/scroll-area'

export function InfoComponent({
  logoUrl,
  storeName,
  description,
  units,
  paymentMethods,
}: {
  logoUrl: string | null
  storeName?: string | null
  description?: string | null
  paymentMethods?: string[]
  units: ({
    businessHours: {
      id: number
      day: string
      open: string
      close: string
      unitId: number
    }[]
  } & {
    id: number
    name: string
    address: string
    cep: string
    phone: string
    email: string
    typeOfDelivery: string
    storeId: string
  })[]
}) {
  return (
    <Drawer>
      <DrawerTrigger>
        <InfoIcon className="h-6 w-6 text-white" />
      </DrawerTrigger>
      <DrawerContent
        autoFocus={false}
        className="h-auto min-h-36"
        showTopElement={false}
        onOpenAutoFocus={e => e.preventDefault()}
      >
        <div className="relative flex h-full w-full flex-col">
          <div className="absolute left-1/2 -mt-6 h-20 w-20 -translate-x-1/2 transform overflow-hidden rounded-full">
            <img
              src={logoUrl || '/assets/images/default-logo.png'}
              alt="logo"
              className="h-full w-full rounded-full object-cover"
            />
          </div>
          <div className="mt-16" />
          <div className="mb-2 flex justify-center">
            <h2 className="text-lg font-medium text-gray-800">{storeName}</h2>
          </div>
          <ScrollArea className="h-auto w-full px-4 pb-8">
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger className="">
                  <div className="flex items-center gap-x-2 text-sm font-medium">
                    <InfoIcon className="h-5 w-5 text-orange-600" />
                    Sobre
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {description ? description : ''}
                </AccordionContent>
              </AccordionItem>
              {units.map((unit, index) => (
                <AccordionItem key={index} value={`item-${index + 2}`}>
                  <AccordionTrigger className="">
                    <div className="flex items-center gap-x-2 text-sm font-medium">
                      <Store className="h-5 w-5 text-orange-600" />
                      {unit.name}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-2">
                      <div className="text-sm">
                        <p className="text-sm">
                          <span className="font-medium">Endereço: </span>
                          {unit.address}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">CEP: </span>
                          {unit.cep}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Contato: </span>
                          {/* Format to Brazilian phone */}
                          {unit.phone.replace(
                            /(\d{2})(\d{5})(\d{4})/,
                            '($1) $2-$3',
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Tipo de entrega
                        </p>
                        <p className="text-sm text-gray-600">
                          {unit.typeOfDelivery === 'deliveryAndPickup' &&
                            'Entrega e Retirada'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {unit.typeOfDelivery === 'delivery' && 'Entrega'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {unit.typeOfDelivery === 'pickup' && 'Retirada'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Horário de funcionamento
                        </p>
                        <div className="flex flex-col gap-1">
                          {unit.businessHours.map((businessHour, index) => (
                            <div
                              className="flex justify-between text-sm text-gray-600"
                              key={index}
                            >
                              <p>{businessHour.day}</p>
                              {businessHour.open === 'closed' ||
                              businessHour.close === 'closed' ? (
                                <p>Fechado</p>
                              ) : (
                                <p>{`${businessHour.open} - ${businessHour.close}`}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="mt-4">
              <div className="flex items-center gap-x-2 text-sm font-medium">
                <Wallet className="h-5 w-5 text-orange-600" />
                Pagamento
              </div>
              <div className="mt-2 flex flex-col gap-1 text-sm text-gray-700">
                {paymentMethods?.map((paymentMethod, index) => (
                  <div key={index}>
                    {paymentMethod === 'cash' ? <div>Dinheiro</div> : null}
                    {paymentMethod === 'credit' ? (
                      <div>Cartão de crédito</div>
                    ) : null}
                    {paymentMethod === 'debit' ? (
                      <div>Cartão de débito</div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
