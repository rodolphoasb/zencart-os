import { useState } from "react";
import { parseWithZod } from "@conform-to/zod";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json, useFetcher, useLoaderData } from "@remix-run/react";
import { getToast, jsonWithSuccess } from "remix-toast";
import { ClientOnly } from "remix-utils/client-only";
import { namedAction } from "remix-utils/named-action";
import slugify from "slugify";
import { toast } from "sonner";
import { z } from "zod";
import { Button2 } from "~/components/ui/button2";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { Option } from "~/components/ui/multi-select";
import { MultipleSelector } from "~/components/ui/multi-select";
import { Textarea } from "~/components/ui/textarea";
import { getUserData } from "~/modules/auth/auth.server";
import { prisma } from "prisma/index.server";
import { handleErrorReturn } from "~/utils/error-handling.server";
import { DrawerDialogConfigVisibility } from "../components/DrawerDialogConfigVisibility";
import { DrawerDialogCreateUnit } from "../components/DrawerDialogCreateUnit";
import { DrawerDialogDeleteUnit } from "../components/DrawerDialogDeleteUnit";
import { DrawerDialogEditUnit } from "../components/DrawerDialogEditUnit";
import { DrawerDialogStyles } from "../components/Estilos";
import { LogoUpload } from "../components/LogoUpload";

const PAYMENT_OPTIONS: Option[] = [
  { label: "Dinheiro", value: "cash" },
  { label: "Cartão de Crédito", value: "credit" },
  { label: "Cartão de Débito", value: "debit" },
  { label: "Pix", value: "pix" },
  { label: "Boleto", value: "boleto" },
  { label: "Transferência Bancária", value: "transfer" },
  { label: "Cheque", value: "check" },
];

export const meta: MetaFunction = () => {
  return [
    { title: "Gerencie sua empresa | Zencart" },
    {
      property: "og:title",
      content: "Gerencie sua empresa | Zencart",
    },
    {
      name: "description",
      content: "Edite os dados da sua empresa e suas unidades.",
    },
  ];
};

const updateStoreSchema = z.object({
  storeName: z.string({
    required_error: "O nome da loja é obrigatório.",
  }),
  slug: z.string({
    required_error: "O slug da loja é obrigatório.",
  }),
  category: z.string({
    required_error: "A categoria da loja é obrigatória.",
  }),
  description: z.string().optional(),
  paymentOptions: z.array(z.string()),
  logoUrl: z.string().optional(),
});

export const unitSchema = z.object({
  name: z.string(),
  address: z.string(),
  cep: z.string(),
  phone: z.string(),
  typeOfDelivery: z.enum(["onlyDelivery", "onlyPickup", "deliveryAndPickup"]),
  businessHours: z.string(),
});

export async function action({ request }: ActionFunctionArgs) {
  const userData = await getUserData(request);
  const storeId = userData?.storeId;

  if (!userData?.userId) {
    return redirect("/login");
  }

  if (!storeId) {
    return redirect("/onboarding?step=1");
  }

  return namedAction(request, {
    async upsertStore() {
      const formData = await request.formData();

      const submission = parseWithZod(formData, {
        schema: updateStoreSchema,
      });

      if (submission.status !== "success") {
        const reply = submission.reply();
        return handleErrorReturn(reply, "Erro ao atualizar loja.");
      }

      const storeName = String(formData.get("storeName"));
      const description = String(formData.get("description"));
      const category = String(formData.get("category"));
      const slug = String(formData.get("slug"));
      const paymentOptions = formData.getAll("paymentOptions") as [string];
      const logoUrl = formData.get("logoUrl")
        ? String(formData.get("logoUrl"))
        : undefined;

      await prisma.store.update({
        where: {
          id: storeId,
        },
        data: {
          name: storeName,
          description: description,
          category: category,
          slug: slugify(slug),
          paymentMethods: paymentOptions[0]
            .split(",")
            .map((value) => value.trim()),
          logoUrl: logoUrl,
        },
      });

      return jsonWithSuccess({ ok: true }, "Loja atualizada com sucesso");
    },

    async createUnit() {
      const formData = await request.formData();
      const submission = parseWithZod(formData, { schema: unitSchema });

      if (submission.status !== "success") {
        return json(submission.reply());
      }

      const { address, businessHours, cep, name, phone, typeOfDelivery } =
        submission.value;

      const unMaskedPhone = phone.replace(/\D/g, "");
      const unMaskedCep = cep.replace(/\D/g, "");

      const parsedBusinessHours = JSON.parse(businessHours) as Record<
        string,
        { open: boolean; from: string; to: string }
      >;

      const insertedUnit = await prisma.unit.create({
        data: {
          name: name,
          address: address,
          cep: unMaskedCep,
          phone: unMaskedPhone,
          email: "", // Assuming email is not provided in form data
          typeOfDelivery: typeOfDelivery,
          storeId: storeId, // You need to provide the storeId
        },
      });

      // Prepare and insert BusinessHour records for each open day
      const businessHourInserts = Object.entries(parsedBusinessHours).map(
        ([day, { open, from, to }]) => ({
          day: day,
          open: open ? from : "closed",
          close: open ? to : "closed",
          unitId: insertedUnit.id,
        })
      );

      if (businessHourInserts.length > 0) {
        await prisma.businessHour.createMany({
          data: businessHourInserts,
        });
      }

      return jsonWithSuccess({ ok: true }, "Unidade criada 🎉");
    },

    async updateUnit() {
      const formData = await request.formData();
      const unitId = Number(formData.get("unitId"));
      const submission = parseWithZod(formData, { schema: unitSchema });

      if (submission.status !== "success") {
        return json(submission.reply());
      }

      const { address, businessHours, cep, name, phone, typeOfDelivery } =
        submission.value;

      const unMaskedPhone = phone.replace(/\D/g, "");
      const unMaskedCep = cep.replace(/\D/g, "");

      const parsedBusinessHours = JSON.parse(businessHours) as Record<
        string,
        { open: boolean; from: string; to: string }
      >;

      await prisma.unit.update({
        where: {
          id: unitId,
        },
        data: {
          name: name,
          address: address,
          cep: unMaskedCep,
          phone: unMaskedPhone,
          typeOfDelivery: typeOfDelivery,
        },
      });

      // Prepare and insert BusinessHour records for each open day
      const businessHourInserts = Object.entries(parsedBusinessHours).map(
        ([day, { open, from, to }]) => ({
          day: day,
          open: open ? from : "closed",
          close: open ? to : "closed",
          unitId: unitId,
        })
      );

      if (businessHourInserts.length > 0) {
        await prisma.businessHour.deleteMany({
          where: {
            unitId: unitId,
          },
        });

        await prisma.businessHour.createMany({
          data: businessHourInserts,
        });
      }

      return jsonWithSuccess({ ok: true }, "Unidade atualizada 🎉");
    },

    async deleteUnit() {
      const formData = await request.formData();
      const unitId = Number(formData.get("unitId"));

      await prisma.businessHour.deleteMany({
        where: {
          unitId: unitId,
        },
      });

      await prisma.unit.delete({
        where: {
          id: unitId,
        },
      });

      return jsonWithSuccess(
        {
          ok: true,
          data: { unitId },
        },
        "Unidade deletada com sucesso"
      );
    },

    async changeStoreStyles() {
      const formData = await request.formData();
      const layoutType = String(formData.get("layoutType"));

      await prisma.store.update({
        where: {
          id: storeId,
        },
        data: {
          typeOfLayout: layoutType as "HORIZONTAL" | "VERTICAL",
        },
      });

      return jsonWithSuccess(
        {
          ok: true,
        },
        "Estilos da loja atualizados com sucesso"
      );
    },

    async updateVisibility() {
      const formData = await request.formData();
      const storeIsVisible = formData.get("storeIsVisible") === "true";
      const storeAcceptsOrdersOnWhatsapp =
        formData.get("storeAcceptsOrdersOnWhatsapp") === "true";
      const storeAcceptsOrdersOutsideBusinessHours =
        formData.get("storeAcceptsOrdersOutsideBusinessHours") === "true";

      await prisma.store.update({
        where: {
          id: storeId,
        },
        data: {
          isVisible: storeIsVisible,
          acceptsOrdersOnWhatsapp: storeAcceptsOrdersOnWhatsapp,
          acceptsOrdersOutsideBusinessHours:
            storeAcceptsOrdersOutsideBusinessHours,
        },
      });

      return jsonWithSuccess(
        {
          ok: true,
        },
        "Visibilidade da loja atualizada com sucesso"
      );
    },
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { toast, headers } = await getToast(request);
  const userData = await getUserData(request);
  const storeId = userData?.storeId;

  if (!storeId) {
    return redirect("/login");
  }

  const storeData = await prisma.store.findUnique({
    where: {
      id: storeId,
    },
  });

  const unitsData = await prisma.unit.findMany({
    where: {
      storeId: storeId,
    },
    include: {
      businessHours: true,
    },
  });

  return json(
    {
      ok: true,
      data: {
        store: storeData,
        units: unitsData,
      },
      error: null,
      toast,
    },
    {
      headers,
    }
  );
}

export default function Screen() {
  const loaderData = useLoaderData<typeof loader>();
  const fetcher = useFetcher({ key: "updsertStore" });
  const [storeSlug, setStoreSlug] = useState(loaderData.data.store?.slug ?? "");
  const [logoUrl, setLogoUrl] = useState(loaderData.data.store?.logoUrl ?? "");
  const [imageIsUploading, setImageIsUploading] = useState(false);

  const [selected, setSelected] = useState<Option[]>(
    loaderData.data.store?.paymentMethods.map((value) => ({
      label:
        PAYMENT_OPTIONS.find((option) => option.value === value)?.label ?? "",
      value: value,
    })) ?? []
  );
  const [file, setFile] = useState<File | null>(null);
  const isPending =
    fetcher.state === "loading" || fetcher.state === "submitting";

  return (
    <div className="flex flex-col">
      <form
        action="?/upsertStore"
        method="post"
        className=""
        onSubmit={async (event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          formData.append("slug", storeSlug);

          // Only proceed with fetcher.submit if file is not present
          if (!file) {
            fetcher.submit(formData, {
              action: "?/upsertStore",
              method: "post",
            });
            return; // Exit early if no file to process
          }

          setImageIsUploading(true);

          // Step 1: Convert File to Base64
          const reader = new FileReader();
          reader.readAsDataURL(file); // Convert the file to Data URL
          reader.onload = async () => {
            const base64String = reader.result?.toString().split(",")[1]; // Remove the Data URL part

            try {
              const response = await fetch("/api/cloudflare/uploadImage", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ base64String: [base64String] }),
              });

              const data = (await response.json()) as {
                url: string;
              }[];

              if (data[0].url) {
                formData.append("logoUrl", getCloudflareImageSrc(data[0].url));
              }

              // Now submit the form data after image URL is set
              fetcher.submit(formData, {
                action: "?/upsertStore",
                method: "post",
              });
            } catch (error) {
              console.error("Error uploading image:", error);
            } finally {
              setImageIsUploading(false);
            }
          };
          reader.onerror = (error) => {
            console.error("Error converting file to Base64:", error);
          };
        }}
      >
        <div className="mb-12 flex items-center justify-between">
          <h1 className="flex items-center text-lg font-semibold text-gray-600">
            Sua empresa
          </h1>
          <div className="flex gap-x-4">
            <Button2
              status={isPending || imageIsUploading ? "pending" : "idle"}
              type="submit"
            >
              Salvar mudanças
            </Button2>
          </div>
        </div>
        <div className="flex flex-col gap-x-8 gap-y-8 sm:flex-row sm:gap-y-8">
          <div className="flex w-full flex-col items-center rounded-lg border p-4 shadow-sm sm:w-1/2 sm:flex-row sm:items-start sm:gap-x-12">
            <div>
              <LogoUpload
                setFile={setFile}
                logoUrl={logoUrl}
                setLogoUrl={setLogoUrl}
              />
              <ClientOnly>
                {() => (
                  <DrawerDialogStyles
                    layoutType={
                      loaderData.data.store?.typeOfLayout ?? "HORIZONTAL"
                    }
                  />
                )}
              </ClientOnly>
            </div>
            <div className="flex w-full flex-col gap-y-4">
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="storeName" className="text-left">
                  Nome da empresa
                </Label>
                <Input
                  id="storeName"
                  name="storeName"
                  placeholder="Ex: Loja do João"
                  className="col-span-3 text-base sm:text-sm"
                  defaultValue={loaderData.data.store?.name ?? ""}
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="description" className="text-left">
                  Descrição
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Ex: Loja do João"
                  className="col-span-3 resize-none text-base sm:text-sm"
                  defaultValue={loaderData.data.store?.description ?? ""}
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="category" className="text-left">
                  Categoria
                </Label>
                <Input
                  id="category"
                  name="category"
                  placeholder="Ex: Padaria"
                  className="col-span-3"
                  defaultValue={loaderData.data.store?.category ?? ""}
                />
              </div>
              <ClientOnly>
                {() => (
                  <DrawerDialogConfigVisibility
                    isVisible={loaderData.data.store?.isVisible ?? false}
                    acceptsOrdersOutsideBusinessHours={
                      loaderData.data.store
                        ?.acceptsOrdersOutsideBusinessHours ?? false
                    }
                    acceptsOrdersOnWhatsapp={
                      loaderData.data.store?.acceptsOrdersOnWhatsapp ?? false
                    }
                  />
                )}
              </ClientOnly>
            </div>
          </div>
          <div className="flex w-full flex-col gap-x-12 rounded-lg border p-4 shadow-sm sm:w-1/2 sm:gap-x-12">
            <div className="flex flex-col gap-y-4">
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="slug" className="text-left">
                  Slug da Loja (Um vez criado não pode ser alterado)
                </Label>
                {Boolean(storeSlug) && storeSlug.length > 0 ? (
                  <Input
                    id="slug"
                    name="slug"
                    placeholder="Ex: seu-slug.zencart.io"
                    className="col-span-3 disabled:bg-gray-100"
                    value={storeSlug}
                    disabled
                  />
                ) : (
                  <Input
                    id="slug"
                    name="slug"
                    placeholder="Ex: seu-slug.zencart.io"
                    className="col-span-3"
                    value={storeSlug}
                    onChange={(e) => setStoreSlug(e.target.value)}
                  />
                )}
              </div>

              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="slugDisplay" className="text-left">
                    Link da sua loja
                  </Label>
                  {storeSlug.length > 0 ? (
                    <div className="flex gap-x-2">
                      <a
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
                        href={
                          process.env.NODE_ENV === "development"
                            ? `http://localhost:3000/s/${storeSlug}`
                            : `https://zencart.io/s/${storeSlug}`
                        }
                      >
                        Ver loja
                      </a>
                      <ClientOnly>
                        {() => (
                          <button
                            type="button"
                            className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `https://${slugify(storeSlug)}.zencart.io`
                              );
                              toast.info("Link copiado");
                            }}
                          >
                            Copiar link
                          </button>
                        )}
                      </ClientOnly>
                    </div>
                  ) : null}
                </div>
                <div className="flex gap-x-2">
                  <Input
                    id="slugDisplay"
                    name="slugDisplay"
                    placeholder="Adicione o seu slug acima."
                    className="col-span-3 disabled:bg-gray-100"
                    disabled
                    value={`https://${slugify(storeSlug)}.zencart.io`}
                  />
                </div>
              </div>
            </div>

            <div className="mb-2 mt-4 h-[1px] w-full bg-gray-100"></div>

            <div>
              <h2 className="text-sm font-medium text-gray-600">
                Formas de Pagamento
              </h2>
              <MultipleSelector
                value={selected}
                onChange={setSelected}
                defaultOptions={PAYMENT_OPTIONS}
                placeholder="Selecione os meios de pagamento"
                emptyIndicator={
                  <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                    Nenhum resultado encontrado.
                  </p>
                }
                inputProps={{
                  className:
                    "md:text-sm focus:outline-none text-base focus:ring-0",
                }}
                badgeClassName="w-fit bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100"
                commandProps={{
                  className: "mt-2",
                }}
              />
              <input
                type="hidden"
                name="paymentOptions"
                value={selected.map((value) => value.value)}
              />
            </div>
          </div>
        </div>
      </form>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-gray-700">Unidades</h2>

          <ClientOnly>{() => <DrawerDialogCreateUnit />}</ClientOnly>
        </div>

        {loaderData.data.units.length === 0 ? (
          <div className="mt-8 flex h-20 w-full flex-col items-center justify-center rounded-lg border border-dashed border-gray-400 p-4">
            <p className="text-sm text-gray-500">
              Você ainda não possui nenhuma unidade.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-8 hidden flex-col sm:flex">
              <div className="mb-2 grid grid-cols-9 grid-rows-1 px-4">
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Nome</p>
                </div>
                <div className="col-span-3">
                  <p className="text-sm font-medium text-gray-500">Endereço</p>
                </div>
                <div className="col-span-3">
                  <p className="text-sm font-medium text-gray-500">
                    Tipo de Entrega
                  </p>
                </div>
                <div className="col-span-1"></div>
              </div>

              <div className="flex flex-col justify-center gap-y-3">
                {loaderData.data.units.map((unit) => {
                  return (
                    <UnitComponent
                      unitId={unit.id}
                      name={unit.name}
                      address={unit.address}
                      key={unit.id}
                      typeOfDelivery={unit.typeOfDelivery}
                      businessHours={unit.businessHours}
                      cep={unit.cep}
                      phone={unit.phone}
                    />
                  );
                })}
              </div>
            </div>

            {/* Mobile */}
            <div className="mt-4 flex flex-col space-y-4 sm:hidden">
              {loaderData.data.units.map((unit) => {
                return (
                  <UnitComponentMobile
                    unitId={unit.id}
                    name={unit.name}
                    address={unit.address}
                    key={unit.id}
                    typeOfDelivery={unit.typeOfDelivery}
                    businessHours={unit.businessHours}
                    cep={unit.cep}
                    phone={unit.phone}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function UnitComponent({
  unitId,
  name,
  address,
  typeOfDelivery,
  businessHours,
  cep,
  phone,
}: {
  unitId: number;
  name: string;
  address: string;
  typeOfDelivery: string;
  cep: string;
  phone: string;
  businessHours: {
    id: number;
    day: string;
    open: string;
    close: string;
    unitId: number;
  }[];
}) {
  return (
    <div className="grid grid-cols-9 grid-rows-1 rounded-lg border p-4">
      <p className="col-span-2 flex items-center text-sm font-medium text-gray-600">
        {name}
      </p>

      <p className="col-span-3 flex items-center text-sm text-gray-500">
        {address}
      </p>
      <p className="col-span-3 flex items-center text-sm text-gray-500">
        {typeOfDelivery === "deliveryAndPickup" && "Entrega e Retirada"}
        {typeOfDelivery === "onlyDelivery" && "Apenas Entrega"}
        {typeOfDelivery === "onlyPickup" && "Apenas Retirada"}
      </p>
      <div className="col-span-1 mr-4 flex items-center justify-end gap-x-2">
        <ClientOnly>
          {() => (
            <DrawerDialogEditUnit
              unitId={unitId}
              address={address}
              businessHours={businessHours}
              name={name}
              typeOfDelivery={typeOfDelivery}
              cep={cep}
              phone={phone}
            />
          )}
        </ClientOnly>
        <ClientOnly>
          {() => <DrawerDialogDeleteUnit unitId={unitId} />}
        </ClientOnly>
      </div>
    </div>
  );
}

function UnitComponentMobile({
  unitId,
  name,
  address,
  typeOfDelivery,
  businessHours,
  cep,
  phone,
}: {
  unitId: number;
  name: string;
  address: string;
  typeOfDelivery: string;
  cep: string;
  phone: string;
  businessHours: {
    id: number;
    day: string;
    open: string;
    close: string;
    unitId: number;
  }[];
}) {
  return (
    <div className="flex flex-col gap-y-3 rounded-lg border p-4">
      <div className="flex flex-col gap-y-2">
        <div>
          <p className="text-sm font-medium text-gray-600">Name</p>
          <p className="text-sm text-gray-500">{name}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Endereço</p>
          <p className="text-sm text-gray-500">{address}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Tipo de entrega</p>
          <p className="text-sm text-gray-500">
            {typeOfDelivery === "deliveryAndPickup" && "Entrega e Retirada"}
            {typeOfDelivery === "onlyDelivery" && "Apenas Entrega"}
            {typeOfDelivery === "onlyPickup" && "Apenas Retirada"}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-end gap-x-2">
        <ClientOnly>
          {() => (
            <DrawerDialogEditUnit
              cep={cep}
              unitId={unitId}
              address={address}
              businessHours={businessHours}
              name={name}
              typeOfDelivery={typeOfDelivery}
              phone={phone}
            />
          )}
        </ClientOnly>
        <ClientOnly>
          {() => <DrawerDialogDeleteUnit unitId={unitId} />}
        </ClientOnly>
      </div>
    </div>
  );
}

function getCloudflareImageSrc(slug: string) {
  return `https://zenvios.io/${slug}`;
}
