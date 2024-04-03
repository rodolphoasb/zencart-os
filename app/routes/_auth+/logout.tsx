import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { createServices } from "~/modules/auth/services.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const {
    auth: { authenticator },
  } = createServices(context);
  return await authenticator.logout(request, { redirectTo: "/" });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const {
    auth: { authenticator },
  } = createServices(context);
  return await authenticator.logout(request, { redirectTo: "/" });
}
