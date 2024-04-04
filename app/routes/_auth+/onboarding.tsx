import { createId } from "@paralleldrive/cuid2";
import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/react";
import { useFetcher, useSearchParams } from "@remix-run/react";
import { namedAction } from "remix-utils/named-action";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { StatusButton } from "~/components/ui/status-button";
import { createServices, getUserData } from "~/modules/auth/services.server";

export const meta: MetaFunction = () => {
  return [{ title: "Onboarding - Configure sua conta" }];
};

// Crie uma organização
// Adicionar membros

export async function action({ context, request }: ActionFunctionArgs) {
  const {
    auth: { getSession, commitSession },
    db,
  } = createServices(context);

  const session = await getSession(request.headers.get("Cookie"));
  const sessionData = session.data;

  console.log("sessionData", sessionData);

  return namedAction(request, {
    async create() {
      const formData = await request.formData();
      const storeName = String(formData.get("storeName"));
      const userId = sessionData.user?.userId;

      const storeId = createId();
      await db.store.create({
        data: {
          id: storeId,
          name: storeName,
          updatedAt: new Date(),
          typeOfLayout: "HORIZONTAL",
          paymentMethods: ["cash", "credit", "debit"],
          owners: {
            connect: {
              id: userId,
            },
          },
        },
      });

      session.set("storeId", storeId);
      const headers = new Headers();
      headers.append("set-cookie", await commitSession(session));

      return redirect(`/home`, {
        headers: headers,
      });
    },
  });
}

export async function loader({ context, request }: ActionFunctionArgs) {
  const user = await getUserData(context, request);

  if (!user) {
    return redirect("/login");
  }

  if (user.storeId) {
    return redirect("/home");
  }

  return null;
}

export default function Screen() {
  const [searchParams] = useSearchParams();
  const step = (searchParams.get("step") as keyof typeof steps) ?? "0";

  const steps = {
    // Create Organization
    "1": <OnboardingStep1 />,
  };

  return (
    <div className="flex h-full flex-1 justify-center bg-gray-50 p-4 pt-16">
      {steps[step]}
    </div>
  );
}

function OnboardingStep1() {
  const fetcher = useFetcher();
  const isPending =
    fetcher.state === "loading" || fetcher.state === "submitting";

  return (
    <div className="h-fit max-w-lg flex-1 rounded-lg bg-white p-8 shadow-md">
      <p className="text-gray-600">Crie uma Organização</p>

      <fetcher.Form
        method="post"
        className="mt-8 flex flex-col gap-y-8"
        action="?/create"
      >
        <div className="flex flex-col gap-y-2">
          <Label htmlFor="storeName" className="text-left">
            Nome
          </Label>
          <Input
            id="storeName"
            name="storeName"
            className="w-full"
            placeholder="Ex: Apple"
          />
        </div>
        <StatusButton
          status={isPending ? "pending" : "idle"}
          disabled={isPending}
          className="w-fit"
          type="submit"
        >
          Criar
        </StatusButton>
      </fetcher.Form>
    </div>
  );
}
