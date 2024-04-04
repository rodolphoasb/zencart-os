import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { createServices } from "~/modules/auth/services.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const {
    auth: { authenticator },
  } = createServices(context);
  await authenticator.authenticate("TOTP", request, {
    successRedirect: "/home",
    failureRedirect: "/login",
  });
}
