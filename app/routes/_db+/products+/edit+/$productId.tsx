import { useState } from "react";
import { parseWithZod } from "@conform-to/zod";
import { createId } from "@paralleldrive/cuid2";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { clientDb } from "db";
import {
  jsonWithError,
  jsonWithSuccess,
  redirectWithSuccess,
} from "remix-toast";
import { ClientOnly } from "remix-utils/client-only";
import { namedAction } from "remix-utils/named-action";
import { z } from "zod";
import { Button2 } from "~/components/ui/button2";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { MoneyInput } from "~/components/ui/moneyInput";
import type { Option } from "~/components/ui/multi-select";
import { MultipleSelector } from "~/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { getUserData } from "~/modules/auth/auth.server";
import { prisma } from "prisma/index.server";
import { handleErrorReturn } from "~/utils/error-handling.server";
import { formatCurrency } from "../utils";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { DDCreateItemCustomizationCategory } from "./components/DDCreateCustomizationCategory";
import { ProductImagesEdit } from "./components/ProductImagesEdit";

export const meta: MetaFunction = () => {
  return [
    { title: "Edite seu produto | Zencart" },
    {
      property: "og:title",
      content: "Edite seu produto | Zencart",
    },
    {
      name: "description",
      content: "Edite os dados do seu produto.",
    },
  ];
};

const newProductSchema = z.object({
  productId: z.string({
    required_error: "O ID do produto é obrigatório.",
  }),
  productName: z.string({
    required_error: "O nome do produto é obrigatório.",
  }),
  description: z
    .string({
      required_error: "A descrição do produto é obrigatória.",
    })
    .optional(),
  imageUrls: z.string().optional(),
  price: z.string({
    required_error: "O preço do produto é obrigatório.",
  }),
  priceType: z.string({
    required_error: "O tipo de preço do produto é obrigatório.",
  }),
  productIsAvailable: z.string(),
  productIsVisible: z.string(),
  productTags: z.string(),
});

const createCustomizationCategorySchema = z.object({
  customizationName: z.string({
    required_error: "O nome da customização é obrigatório.",
  }),
  customizationMin: z.number(),
  customizationMax: z.number(),
  productId: z.string({
    required_error: "O ID do produto é obrigatório.",
  }),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const userData = await getUserData(request);
  const storeId = userData?.storeId;

  if (!storeId) {
    return redirect("/login");
  }

  const productIdParam = params.productId;

  return namedAction(request, {
    async saveProduct() {
      const formData = await request.formData();
      formData.append("productId", productIdParam?.toString() ?? "");
      const submission = parseWithZod(formData, { schema: newProductSchema });

      // Send the submission back to the client if the status is not successful
      if (submission.status !== "success") {
        const reply = submission.reply();
        return handleErrorReturn(reply, "Erro ao salvar produto.");
      }

      const {
        productId,
        description,
        imageUrls,
        price,
        priceType,
        productIsAvailable,
        productIsVisible,
        productName,
        productTags,
      } = submission.value;

      const unMaskedPrice = formatCurrency(price);

      const parsedTags = JSON.parse(productTags) as {
        id?: string;
        label: string;
        value: string;
      }[];

      const tagsToBeCreated = parsedTags
        .filter((tag) => !tag.id)
        .map((tag) => {
          return { id: createId(), name: tag.value, storeId: storeId };
        });

      let tags: {
        id: string;
        name: string;
        storeId: string;
        createdAt: Date;
      }[] = [];

      if (tagsToBeCreated.length > 0) {
        tags = await clientDb
          .insertInto("Tag")
          .values(tagsToBeCreated)
          .returningAll()
          .execute();
      }

      const concatenatedTags = [
        ...(tags.map((tag) => {
          return { id: tag.id, name: tag.name };
        }) ?? []),
        ...(parsedTags
          .filter((tag) => tag.id)
          .map((tag) => {
            return { id: tag.id as string, name: tag.value };
          }) ?? []),
      ];

      // Tags to be deleted
      const existingProductTags = await prisma.item.findUnique({
        where: {
          id: productId,
        },
        include: {
          tags: true,
        },
      });

      const tagsToBeDeleted = existingProductTags?.tags.filter(
        (tag) => !concatenatedTags.some((t) => t.id === tag.id)
      );

      if (tagsToBeDeleted && tagsToBeDeleted?.length > 0) {
        await clientDb
          .deleteFrom("Tag")
          .where(
            "id",
            "in",
            tagsToBeDeleted.map((tag) => tag.id)
          )
          .execute();
      }

      // Make the images diff
      const parsedImageUrls = imageUrls ? JSON.parse(imageUrls) : [];

      await clientDb
        .updateTable("Item")
        .set({
          name: productName,
          description: description,
          price: Number(unMaskedPrice) * 100,
          priceType: priceType === "is" ? "is" : "startsAt",
          isAvailable: productIsAvailable === "true",
          isVisible: productIsVisible === "true",
          itemImages: parsedImageUrls,
          storeId: storeId,
          updatedAt: new Date(),
        })
        .where("id", "=", productId)
        .returning("id")
        .executeTakeFirstOrThrow();

      if (concatenatedTags.length > 0) {
        await clientDb
          .insertInto("_ItemToTag")
          .values([
            ...concatenatedTags.map((tag) => {
              return {
                A: productId,
                B: tag.id,
              };
            }),
          ])
          .onConflict((oc) => oc.columns(["A", "B"]).doNothing())
          .execute();
      }

      return redirectWithSuccess(`/products`, {
        message: "Produto atualizado com sucesso.",
      });
    },

    async createCustomizationCategory() {
      const formData = await request.formData();
      formData.append("productId", productIdParam?.toString() ?? "");
      const submission = parseWithZod(formData, {
        schema: createCustomizationCategorySchema,
      });

      if (submission.status !== "success") {
        const reply = submission.reply();
        return handleErrorReturn(
          reply,
          "Erro ao criar categoria de customização."
        );
      }

      const {
        customizationMax,
        customizationMin,
        customizationName,
        productId,
      } = submission.value;

      await clientDb
        .insertInto("CustomizationCategory")
        .values({
          name: customizationName,
          min: customizationMin,
          max: customizationMax,
          itemId: productId,
        })
        .executeTakeFirstOrThrow();

      return jsonWithSuccess(
        {
          ok: true,
        },
        "Categoria de customização criada com sucesso."
      );
    },

    async editCustomizationCategory() {
      const formData = await request.formData();
      const submission = parseWithZod(formData, {
        schema: z.object({
          customizationCategoryId: z.number({
            required_error: "O ID da categoria de customização é obrigatório.",
          }),
          customizationName: z.string({
            required_error: "O nome da customização é obrigatório.",
          }),
          customizationMin: z.number(),
          customizationMax: z.number(),
        }),
      });

      if (submission.status !== "success") {
        const reply = submission.reply();
        return handleErrorReturn(reply, "Erro ao salvar alteração.");
      }

      const {
        customizationCategoryId,
        customizationMax,
        customizationMin,
        customizationName,
      } = submission.value;

      await clientDb
        .updateTable("CustomizationCategory")
        .set({
          name: customizationName,
          min: customizationMin,
          max: customizationMax,
        })
        .where("id", "=", customizationCategoryId)
        .execute();

      return jsonWithSuccess(
        {
          ok: true,
        },
        "Categoria de customização atualizada com sucesso."
      );
    },

    async deleteCustomizationCategory() {
      const formData = await request.formData();
      const submission = parseWithZod(formData, {
        schema: z.object({
          customizationCategoryId: z.number({
            required_error: "O ID da categoria de customização é obrigatório.",
          }),
        }),
      });

      if (submission.status !== "success") {
        const reply = submission.reply();
        return handleErrorReturn(
          reply,
          "Erro ao deletar categoria de customização."
        );
      }
      const { customizationCategoryId } = submission.value;

      await clientDb
        .deleteFrom("ItemCustomization")
        .where("customizationCategoryId", "=", customizationCategoryId)
        .execute();

      await clientDb
        .deleteFrom("CustomizationCategory")
        .where("id", "=", customizationCategoryId)
        .execute();

      return jsonWithSuccess(
        {
          ok: true,
        },
        "Categoria de customização deletada com sucesso."
      );
    },

    // This will add or delete a customization item
    async createOrDeleteCustomizationItem() {
      const formData = await request.formData();
      const submission = parseWithZod(formData, {
        schema: z.object({
          customizationCategoryId: z.number({
            required_error: "O ID da categoria de customização é obrigatório.",
          }),
          customizationItems: z.string(),
        }),
      });

      if (submission.status !== "success") {
        const reply = submission.reply();
        return handleErrorReturn(reply, "Erro ao criar/deletar item.");
      }

      const { customizationCategoryId, customizationItems } = submission.value;

      const parsedCustomizationItems = JSON.parse(customizationItems) as {
        id?: number;
        name: string;
        price: string;
        createdAt?: string;
        updatedAt?: string;
        orderItemId?: number | null;
        customizationCategoryId?: number;
      }[];

      const parsedCustomizationItemsWithUnmaskedPrice =
        parsedCustomizationItems.map((item) => {
          return {
            ...item,
            price:
              typeof item.price === "number"
                ? item.price
                : Number(item.price.replace(/[R$\.,]/g, "")),
          };
        });

      const submittedIds = parsedCustomizationItemsWithUnmaskedPrice
        .filter((item) => item.id)
        .map((item) => item.id);

      const currentItems = await clientDb
        .selectFrom("ItemCustomization")
        .selectAll()
        .where("customizationCategoryId", "=", customizationCategoryId)
        .execute();

      const currentIds = currentItems.map((item) => item.id);

      const itemsToBeDeleted = currentIds.filter(
        (id) => !submittedIds.includes(id)
      );

      const itemsToBeCreated = parsedCustomizationItemsWithUnmaskedPrice
        .filter((item) => !item.id)
        .map((item) => ({
          name: item.name,
          price: item.price,
          customizationCategoryId: customizationCategoryId,
        }));

      // Identify items to be updated
      const itemsToBeUpdated = parsedCustomizationItemsWithUnmaskedPrice.filter(
        (item) =>
          item.id &&
          currentItems.some(
            (currentItem) =>
              currentItem.id === item.id &&
              (currentItem.name !== item.name ||
                currentItem.price !== item.price)
          )
      );

      try {
        // Create new items
        if (itemsToBeCreated.length > 0) {
          await clientDb
            .insertInto("ItemCustomization")
            .values(itemsToBeCreated)
            .execute();
        }

        // Update existing items
        for (const item of itemsToBeUpdated) {
          if (!item.id) {
            continue;
          }

          await clientDb
            .updateTable("ItemCustomization")
            .set({
              name: item.name,
              price: item.price,
            })
            .where("id", "=", item.id)
            .execute();
        }

        // Delete removed items
        if (itemsToBeDeleted.length > 0) {
          await clientDb
            .deleteFrom("ItemCustomization")
            .where("id", "in", itemsToBeDeleted)
            .execute();
        }

        return jsonWithSuccess({ ok: true }, "Items atualizados");
      } catch (error) {
        return jsonWithError({ ok: false }, "Erro ao criar/deletar item.");
      }
    },
  });
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const productId = params.productId;
  const userData = await getUserData(request);
  const storeId = userData?.storeId;

  if (!storeId) {
    return redirect("/login");
  }

  const item = await prisma.item.findUnique({
    where: {
      id: productId,
    },
    include: {
      tags: true,
      customizationCategories: {
        include: {
          itemCustomizations: true,
        },
      },
    },
  });

  const tags = await clientDb
    .selectFrom("Tag")
    .selectAll()
    .where("Tag.storeId", "=", storeId)
    .execute();

  return json({
    ok: true,
    data: {
      item,
      tags,
    },
  });
}

export default function Page() {
  const fetcher = useFetcher<typeof action>();
  const isPending =
    fetcher.state === "loading" || fetcher.state === "submitting";
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const { data } = useLoaderData<typeof loader>();
  const [productIsVisible, setProductIsVisible] = useState(
    data.item?.isVisible ?? true
  );
  const [productIsAvailable, setProductIsAvailable] = useState(
    data.item?.isAvailable ?? true
  );
  const [selectedTags, setSelectedTags] = useState<Option[]>(
    data.item?.tags.map((tag) => {
      return {
        id: tag.id,
        label: tag.name,
        value: tag.name,
      };
    }) ?? []
  );
  const [currentImages, setCurrentImages] = useState<string[]>(
    data.item?.itemImages ?? []
  );
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  return (
    <div className="flex flex-col">
      <form
        action="post"
        onSubmit={async (event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          formData.append("productIsAvailable", productIsAvailable.toString());
          formData.append("productIsVisible", productIsVisible.toString());
          formData.append("productTags", JSON.stringify(selectedTags));

          if (imageFiles.length === 0) {
            formData.append("imageUrls", JSON.stringify(currentImages));
            fetcher.submit(formData, {
              action: "?/saveProduct",
              method: "post",
            });
            return;
          }

          setIsUploadingImages(true);

          let imageUrls: (string | null)[] = [];

          if (imageFiles.length > 0) {
            const base64Strings: string[] = [];

            // Convert each file to Base64
            const readAsDataURL = (
              file: File
            ): Promise<string | null | ArrayBuffer> =>
              new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(file);
              });

            // Create an array of promises to convert all files to base64
            const promises = Array.from(imageFiles).map(async (file) => {
              const base64 = await readAsDataURL(file);
              if (typeof base64 === "string") {
                base64Strings.push(base64?.split(",")[1]); // Remove the Data URL part and store
              }
            });

            // Wait for all files to be processed
            Promise.all(promises)
              .then(async () => {
                try {
                  const response = await fetch("/api/cloudflare/uploadImage", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ base64String: base64Strings }), // Send array of base64 strings
                  });

                  const jsonData = (await response.json()) as { url: string }[];

                  imageUrls = jsonData.map((image) =>
                    getCloudflareImageSrc(image.url)
                  );

                  const imageUrlsJson = JSON.stringify([
                    ...imageUrls,
                    ...currentImages,
                  ]);

                  formData.append("imageUrls", imageUrlsJson);
                  // // Submit the final form data including the image URLs
                  fetcher.submit(formData, {
                    action: "?/saveProduct",
                    method: "post",
                  });
                } catch (error) {
                  console.error("Error uploading images:", error);
                }
              })
              .catch((error) => {
                console.error("Error converting files to Base64:", error);
              })
              .finally(() => {
                setIsUploadingImages(false);
              });
          }
        }}
      >
        <div className="mb-12 flex items-center justify-between">
          <h1 className="flex items-center text-lg font-semibold text-gray-600">
            Editar produto
          </h1>
          <div className="flex gap-x-4">
            <Button2
              status={isPending || isUploadingImages ? "pending" : "idle"}
              type="submit"
            >
              Salvar
            </Button2>
          </div>
        </div>
        <div className="flex flex-col gap-y-8 sm:flex-row sm:gap-x-8 sm:gap-y-0">
          <div className="flex w-full gap-x-12 rounded-lg border p-4 shadow-sm sm:w-1/2">
            <div className="flex w-full flex-col gap-y-4">
              <ProductImagesEdit
                currentImages={currentImages}
                setCurrentImages={setCurrentImages}
                setImageFiles={setImageFiles}
                imageFiles={imageFiles}
              />
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="productName" className="text-left">
                  Nome do produto
                </Label>
                <Input
                  id="productName"
                  name="productName"
                  placeholder="Ex: Camiseta"
                  className="col-span-3"
                  defaultValue={data.item?.name}
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="description" className="text-left">
                  Descrição
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Ex: Camiseta de algodão com estampa de cachorro"
                  className="col-span-3 resize-none text-base sm:text-sm"
                  defaultValue={data.item?.description ?? ""}
                />
              </div>
            </div>
          </div>
          <div className="flex w-full flex-col gap-x-12 rounded-lg border p-4 shadow-sm sm:w-1/2">
            <div>
              <h2 className="text-sm font-medium text-gray-600">
                Tags relacionadas
              </h2>
              <MultipleSelector
                value={selectedTags}
                onChange={setSelectedTags}
                defaultOptions={data.tags.map((tag) => ({
                  id: tag.id,
                  label: tag.name,
                  value: tag.name,
                }))}
                placeholder="Selecione as tags relacionadas (categorias do produto)"
                emptyIndicator={
                  <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                    Nenhum resultado encontrado.
                  </p>
                }
                inputProps={{
                  className:
                    "text-sm focus:outline-none text-base focus:ring-0",
                }}
                badgeClassName="w-fit bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100"
                commandProps={{
                  className: "mt-2",
                }}
                creatable
              />
            </div>
            <div className="my-2 h-[1px] w-full bg-gray-100"></div>
            <div>
              <h2 className="text-sm font-medium text-gray-600">Preço</h2>
              <p className="text-xs text-gray-500">O preço...</p>
              <div className="mt-2 flex gap-x-4">
                <Select
                  defaultValue={
                    data.item?.priceType === "is" ? "is" : "startsAt"
                  }
                  name="priceType"
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="is">É</SelectItem>
                      <SelectItem value="startsAt">É a partir de</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <MoneyInput
                  id="price"
                  name="price"
                  defaultValue={
                    data.item?.price ? (data.item?.price / 100).toFixed(2) : ""
                  }
                  placeholder="Ex: 30"
                />
              </div>
            </div>
            <div className="my-4 h-[1px] w-full bg-gray-100"></div>

            <div className="flex gap-x-4">
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="category" className="text-left">
                  Disponível
                </Label>
                <Switch
                  checked={productIsAvailable}
                  onCheckedChange={setProductIsAvailable}
                  id="productIsAvailable"
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="category" className="text-left">
                  Visível
                </Label>
                <Switch
                  checked={productIsVisible}
                  onCheckedChange={setProductIsVisible}
                  id="productIsVisiblee"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
      <div className="mt-12">
        {/* Item customizations */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-600">
            Customizações
          </h2>
          <ClientOnly>{() => <DDCreateItemCustomizationCategory />}</ClientOnly>
        </div>
        {data.item?.customizationCategories &&
        data.item?.customizationCategories.length > 0 ? (
          <DataTable
            columns={columns}
            data={data.item.customizationCategories}
          />
        ) : (
          <div className="mt-8 flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-gray-400 p-4 transition-all hover:bg-gray-50">
            <p className="text-sm text-gray-500">
              Customizações são as variações do seu produto. Exemplo: Tamanho,
              Quantidade, Cor, etc.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function getCloudflareImageSrc(slug: string) {
  return `https://zenvios.io/${slug}`;
}
