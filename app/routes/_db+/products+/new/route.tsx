import { useState } from "react";
import { parseWithZod } from "@conform-to/zod";
import { createId } from "@paralleldrive/cuid2";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import { json, useFetcher, useLoaderData } from "@remix-run/react";
import { redirectWithSuccess } from "remix-toast";
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
import { handleErrorReturn } from "~/utils/error-handling.server";
import { ProductImages } from "../components/ProductImages";
import { formatCurrency } from "../utils";
import { prisma } from "prisma/index.server";
import { getUserData } from "~/modules/auth/services.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Crie seu produto | Zencart" },
    {
      property: "og:title",
      content: "Crie seu produto | Zencart",
    },
    {
      name: "description",
      content: "Adicione os dados do seu produto.",
    },
  ];
};

const newProductSchema = z.object({
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

export async function action({ context, request }: ActionFunctionArgs) {
  const userData = await getUserData(context, request);
  const storeId = userData?.storeId;

  if (!storeId) {
    return redirect("/login");
  }

  return namedAction(request, {
    async saveProduct() {
      const formData = await request.formData();
      const submission = parseWithZod(formData, { schema: newProductSchema });

      // Send the submission back to the client if the status is not successful
      if (submission.status !== "success") {
        const reply = submission.reply();
        return handleErrorReturn(reply, "Erro ao salvar alterações.");
      }

      const {
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
      const parsedImageUrls = imageUrls
        ? (JSON.parse(imageUrls) as string[])
        : [];

      let tags: {
        id: string;
        name: string;
        storeId: string;
        createdAt: Date;
      }[] = [];

      if (tagsToBeCreated.length > 0) {
        await prisma.tag.createMany({
          data: tagsToBeCreated.map((tag) => {
            return {
              id: tag.id,
              name: tag.name,
              storeId: storeId,
            };
          }),
        });

        tags = await prisma.tag.findMany({
          where: {
            id: {
              in: tagsToBeCreated.map((tag) => tag.id),
            },
          },
        });
      }

      const concatenatedTags = [
        ...tags.map((tag) => {
          return { id: tag.id, name: tag.name };
        }),
        ...parsedTags
          .filter((tag) => tag.id)
          .map((tag) => {
            return { id: tag.id as string, name: tag.value };
          }),
      ];

      const item = await prisma.item.create({
        data: {
          id: createId(),
          name: productName,
          description: description,
          price: Number(unMaskedPrice) * 100,
          priceType: priceType === "is" ? "is" : "startsAt",
          isAvailable: productIsAvailable === "true",
          isVisible: productIsVisible === "true",
          itemImages: parsedImageUrls,
          storeId: storeId,
          tags: {
            connect: concatenatedTags.map((tag) => {
              return {
                id: tag.id,
              };
            }),
          },
        },
      });

      return redirectWithSuccess(`/products/edit/${item?.id}`, {
        message: "Produto criado com sucesso.",
        description: "Agora você pode adicionar customizaçoẽs e variações.",
      });
    },
  });
}

export async function loader({ context, request }: LoaderFunctionArgs) {
  const userData = await getUserData(context, request);
  const storeId = userData?.storeId;

  if (!storeId) {
    return redirect("/login");
  }

  const tags = await prisma.tag.findMany({
    where: {
      storeId: storeId,
    },
  });

  return json({
    ok: true,
    data: {
      tags: tags,
    },
  });
}

export default function NewProductPage() {
  const fetcher = useFetcher<typeof action>();
  const isPending =
    fetcher.state === "loading" || fetcher.state === "submitting";
  const [productIsAvailable, setProductIsAvailable] = useState(true);
  const [productIsVisible, setProductIsVisible] = useState(true);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [selectedTags, setSelectedTags] = useState<Option[]>([]);
  const { data } = useLoaderData<typeof loader>();
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
            fetcher.submit(formData, {
              action: "?/saveProduct",
              method: "post",
            });
            return null;
          }

          let imageUrls: (string | null)[] = [];

          setIsUploadingImages(true);

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

                  const data = (await response.json()) as { url: string }[];

                  imageUrls = data.map((image) =>
                    getCloudflareImageSrc(image.url)
                  );

                  const imageUrlsJson = JSON.stringify(imageUrls);

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
            Crie um novo produto
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
              <ProductImages setImageFiles={setImageFiles} />
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="productName" className="text-left">
                  Nome do produto
                </Label>
                <Input
                  id="productName"
                  name="productName"
                  placeholder="Ex: Camiseta"
                  className="col-span-3 text-base sm:text-sm"
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
                <Select name="priceType">
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
                <MoneyInput id="price" name="price" placeholder="Ex: 30" />
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
    </div>
  );
}

function getCloudflareImageSrc(slug: string) {
  return `https://zenvios.io/${slug}`;
}

// Customização:
// - Nome
// - Descrição
// - Categoria
// - Disponível
// - Preço
