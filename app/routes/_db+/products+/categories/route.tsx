import { parseWithZod } from "@conform-to/zod";
import { createId } from "@paralleldrive/cuid2";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { jsonWithSuccess } from "remix-toast";
import { ClientOnly } from "remix-utils/client-only";
import { namedAction } from "remix-utils/named-action";
import { z } from "zod";
import { Button2 } from "~/components/ui/button2";
import { handleErrorReturn } from "~/utils/error-handling.server";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { DrawerDialogCreateCategory } from "./components/DrawerDialogCreateCategory";
import { createServices, getUserData } from "~/modules/auth/services.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Manage your categories | Zencart" },
    {
      property: "og:title",
      content: "Manage your categories | Zencart",
    },
    {
      name: "description",
      content: "Add, edit, and delete categories from your store.",
    },
  ];
};

const newCategorySchema = z.object({
  name: z.string({
    required_error: "The product name is required.",
  }),
  categoryTags: z.string(),
});

const updateCategorySchema = z.object({
  name: z.string({
    required_error: "The product name is required.",
  }),
  categoryTags: z.string(),
  categoryId: z.string(),
});

const deleteCategorySchema = z.object({
  categoryId: z.string(),
});

export async function action({ context, request }: ActionFunctionArgs) {
  const userData = await getUserData(context, request);
  const { db: prisma } = createServices(context);
  const storeId = userData?.storeId;

  if (!storeId) {
    return redirect("/login");
  }

  return namedAction(request, {
    async createCategory() {
      const formData = await request.formData();
      const submission = parseWithZod(formData, { schema: newCategorySchema });

      // Send the submission back to the client if the status is not successful
      if (submission.status !== "success") {
        return json(submission.reply());
      }

      const { name, categoryTags } = submission.value;

      const parsedTags = JSON.parse(categoryTags) as {
        id?: string;
        label: string;
        value: string;
      }[];

      await prisma.category.create({
        data: {
          id: createId(),
          name,
          storeId,
          tags: {
            connect: parsedTags.map((tag) => ({
              id: tag.id,
            })),
          },
        },
      });

      return jsonWithSuccess(
        {
          ok: true,
        },
        "Category created successfully"
      );
    },

    async updateCategory() {
      const formData = await request.formData();
      const submission = parseWithZod(formData, {
        schema: updateCategorySchema,
      });

      // Send the submission back to the client if the status is not successful
      if (submission.status !== "success") {
        const reply = submission.reply();
        return handleErrorReturn(reply, "Error updating the category.");
      }

      console.log(submission.value);

      const { name, categoryTags, categoryId } = submission.value;

      const parsedTags = JSON.parse(categoryTags) as {
        id?: string;
        label: string;
        value: string;
      }[];

      await prisma.category.update({
        where: {
          id: categoryId,
        },
        data: {
          name,
          tags: {
            set: parsedTags.map((tag) => ({
              id: tag.id,
            })),
          },
        },
      });

      return jsonWithSuccess(
        {
          ok: true,
        },
        "Category updated successfully"
      );
    },
    async deleteCategory() {
      const formData = await request.formData();
      const submission = parseWithZod(formData, {
        schema: deleteCategorySchema,
      });

      // Send the submission back to the client if the status is not successful
      if (submission.status !== "success") {
        const reply = submission.reply();
        return handleErrorReturn(reply, "Error deleting the category.");
      }

      const { categoryId } = submission.value;

      await prisma.category.delete({
        where: {
          id: categoryId,
        },
      });

      return jsonWithSuccess(
        {
          ok: true,
        },
        "Category deleted successfully"
      );
    },
  });
}

export async function loader({ context, request }: LoaderFunctionArgs) {
  const userData = await getUserData(context, request);
  const { db: prisma } = createServices(context);
  const storeId = userData?.storeId;

  if (!storeId) {
    return redirect("/login");
  }

  const categories = await prisma.category.findMany({
    where: {
      storeId,
    },
    include: {
      tags: true,
    },
  });

  const tags = await prisma.tag.findMany({
    where: {
      storeId,
    },
  });

  return json({
    ok: true,
    data: {
      tags,
      categories,
    },
  });
}

export default function ManageCategoriesPage() {
  const { data } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col">
      <div className="mb-12 flex items-center justify-between">
        <h1 className="flex items-center text-lg font-semibold text-gray-600">
          Manage your categories
        </h1>
        <div className="flex gap-x-4">
          <ClientOnly>
            {() => (
              <DrawerDialogCreateCategory tags={data.tags}>
                <Button2>Create Category</Button2>
              </DrawerDialogCreateCategory>
            )}
          </ClientOnly>
        </div>
      </div>

      {data.categories.length > 0 ? (
        <DataTable columns={columns} data={data.categories} />
      ) : (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-y-3 rounded-md border-2 border-dashed bg-white p-4">
          <p className="text-center text-sm text-gray-600">
            You haven&#39;t created any categories yet. <br /> Click the button
            above to create your first category.
          </p>
        </div>
      )}
    </div>
  );
}
