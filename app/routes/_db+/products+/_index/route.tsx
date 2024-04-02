import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { jsonWithSuccess } from "remix-toast";
import { namedAction } from "remix-utils/named-action";
import { Button2 } from "~/components/ui/button2";
import { prisma } from "prisma/index.server";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { getUserData } from "~/modules/auth/auth.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Gerencie seus Produtos | Zencart" },
    {
      property: "og:title",
      content: "Gerencie seus Produtos | Zencart",
    },
    {
      name: "description",
      content: "Adicione, edite e exclua produtos da sua loja.",
    },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  return namedAction(request, {
    async deleteProduct() {
      const formData = await request.formData();
      const productId = formData.get("productId") as string;

      if (!productId) {
        return json({ ok: false, error: "Missing productId" }, { status: 400 });
      }

      await prisma.item.delete({
        where: {
          id: productId,
        },
      });
      await prisma.tag.deleteMany({
        where: {
          items: {
            some: {
              id: productId,
            },
          },
        },
      });

      return jsonWithSuccess({ ok: true }, "Produto excluído com sucesso");
    },
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  const userData = await getUserData(request);
  const storeId = userData?.storeId;

  if (!storeId) {
    return redirect("/login");
  }

  const products = await prisma.item.findMany({
    where: {
      storeId: storeId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      tags: true,
    },
  });

  return json({
    ok: true,
    data: {
      products,
    },
  });
}

export default function Screen() {
  const { data } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col">
      <div className="mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="flex items-start text-lg font-semibold text-gray-600">
          Seus produtos
        </h1>
        <div className="mt-4 flex flex-col gap-x-4 gap-y-2 sm:mt-0 sm:flex-row sm:gap-y-0">
          <Button2 href={`/products/categories`} color="white">
            Ajustar Categorias
          </Button2>
          <Button2 href={`/products/new`}>Criar produto</Button2>
        </div>
      </div>

      {data.products.length > 0 ? (
        <DataTable columns={columns} data={data.products} />
      ) : (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-y-3 rounded-md border-2 border-dashed bg-white p-4">
          <p className="text-center text-sm text-gray-600">
            Você ainda não criou nenhum produto. <br />{" "}
            <Link
              className={`border-dashed border-gray-700 font-semibold hover:border-b hover:text-gray-700`}
              to="/products/new"
            >
              Clique aqui
            </Link>{" "}
            para criar seu primeiro produto.
          </p>
        </div>
      )}
    </div>
  );
}
