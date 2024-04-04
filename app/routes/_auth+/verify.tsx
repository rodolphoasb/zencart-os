import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { createServices } from "~/modules/auth/services.server";

export async function loader({ context, request }: LoaderFunctionArgs) {
  const {
    auth: { getSession, commitSession },
  } = createServices(context);

  const session = await getSession(request.headers.get("cookie"));
  const authEmail = session.data.user?.email;
  if (!authEmail) return redirect("/login");
  const authError = session.get("auth:error");

  // Commit session to clear any `flash` error message.
  return json({ authEmail, authError } as const, {
    headers: {
      "set-cookie": await commitSession(session),
    },
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const {
    auth: { authenticator },
  } = createServices(context);
  const url = new URL(request.url);
  await authenticator.authenticate("TOTP", request, {
    successRedirect: url.pathname,
    failureRedirect: url.pathname,
  });
}

export default function Verify() {
  const { authEmail, authError } = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto flex h-screen w-screen max-w-7xl flex-col px-6">
      <div className="mx-auto flex h-full w-full max-w-[350px] flex-col items-center justify-center gap-6">
        {/* Code Verification Form */}
        <div className="flex w-full flex-col items-center gap-6">
          <div className="flex w-full flex-col items-center justify-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <h1 className="text-2xl font-semibold tracking-tight">
                Please check your inbox
              </h1>
              <p className="text-center text-base font-normal text-gray-600">
                We&#39;ve sent you a magic link email.
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col items-center justify-center gap-2">
            {/* Request New Code. */}
            {/* Email is already in session, so no input it's required. */}
            <Form
              method="POST"
              autoComplete="off"
              className="flex w-full flex-col gap-2"
            >
              <button
                type="submit"
                className="clickable flex h-10 items-center justify-center rounded-md bg-gray-200"
              >
                <span className="text-sm font-semibold text-black">
                  Request New Code
                </span>
              </button>
            </Form>
          </div>
        </div>

        {/* Errors Handling. */}
        {authEmail && authError && (
          <span className="font-semibold text-red-400">
            {authError?.message}
          </span>
        )}

        <p className="text-center text-xs leading-relaxed text-gray-400">
          By continuing, you agree to our{" "}
          <span className="clickable underline">Terms of Service</span>
        </p>
      </div>
    </div>
  );
}
