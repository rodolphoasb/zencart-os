// app/routes/login.tsx
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { Button2 } from "~/components/ui/button2";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { createServices } from "~/modules/auth/services.server";
import { useIsPending } from "~/utils";

export async function loader({ context, request }: LoaderFunctionArgs) {
  const {
    auth: { authenticator, getSession, commitSession },
  } = createServices(context);
  await authenticator.isAuthenticated(request, {
    successRedirect: "/home",
  });

  const session = await getSession(request.headers.get("Cookie"));
  const authError = session.get("auth:error");

  // Commit session to clear any `flash` error message.
  return json(
    { authError },
    {
      headers: {
        "set-cookie": await commitSession(session),
      },
    }
  );
}

export async function action({ context, request }: ActionFunctionArgs) {
  const {
    auth: { authenticator },
  } = createServices(context);
  await authenticator.authenticate("TOTP", request, {
    successRedirect: "/verify",
    failureRedirect: "/login",
  });
}

export default function Login() {
  const { authError } = useLoaderData<typeof loader>();
  const isPending = useIsPending();

  return (
    <div className="flex min-h-screen flex-1">
      <div className="w-full sm:w-1/2">
        <div className="flex h-full w-full flex-col justify-center px-4 py-16 sm:px-32">
          <h1 className="text-3xl font-bold">Sign in to your account</h1>
          <Form className="mt-8 flex w-full flex-col" method="post">
            <div className="flex flex-col">
              <div className="flex flex-col gap-y-4">
                <div className="flex flex-col gap-y-2">
                  <Label htmlFor="email" className="text-left">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    placeholder="yourEmail@email.com"
                    className="col-span-3"
                  />
                </div>
              </div>
              <Button2
                status={isPending ? "pending" : "idle"}
                disabled={isPending}
                className="mt-8 w-fit"
                type="submit"
              >
                Sign in
              </Button2>
            </div>
            <span>{authError?.message}</span>
          </Form>
        </div>
      </div>
      <div className="hidden bg-zinc-100 sm:flex sm:w-1/2"></div>
    </div>
  );
}
