import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { authenticator } from "~/modules/auth/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticator.authenticate("TOTP", request, {
    successRedirect: "/home",
    failureRedirect: "/login",
  });
}
