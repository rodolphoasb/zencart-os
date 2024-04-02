import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { authenticator } from "~/modules/auth/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  return await authenticator.logout(request, { redirectTo: "/" });
}

export async function action({ request }: ActionFunctionArgs) {
  return await authenticator.logout(request, { redirectTo: "/" });
}
