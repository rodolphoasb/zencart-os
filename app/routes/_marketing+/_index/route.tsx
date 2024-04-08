import { createId } from "@paralleldrive/cuid2";
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect,
} from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { jsonWithError } from "remix-toast";
import { getTenant } from "~/utils/getTenant.server";
import { Faqs } from "./components/Faqs";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Pricing } from "./components/Pricing";
import { PrimaryFeatures } from "./components/PrimaryFeatures";
import { SecondaryFeatures } from "./components/SecondaryFeatures";
import { createServices } from "~/modules/auth/services.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Zencart | WhatsApp Your Way to More Sales" },
    {
      property: "og:title",
      content: "Zencart | WhatsApp Your Way to More Sales",
    },
    {
      name: "description",
      content:
        "Make shopping a breeze for your customers and boost your sales. Create a digital catalog for your store with Zencart in just a few minutes.",
    },
  ];
};

export async function loader({ context, request }: LoaderFunctionArgs) {
  const { tenant, tld, domain } = getTenant(request);

  const isTestingTenantLocally =
    context.cloudflare.env.ENVIRONMENT === "development" &&
    Boolean(tenant) &&
    domain === "localhost";

  if (isTestingTenantLocally === false) {
    if (!tld || (tld === "io" && tenant === "www") || domain === "ngrok-free") {
      return json({ isTenant: false, data: null });
    }
  }

  return redirect(
    context.cloudflare.env.ENVIRONMENT === "development"
      ? `http://localhost:3000/s/${tenant}`
      : `https://zencart.io/s/${tenant}`,
    302
  );
}

export async function action({ context, request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const { db: prisma } = createServices(context);

  const name = formData.get("name") as string;
  const phoneNumber = formData.get("phoneNumber") as string;

  if (!name || !phoneNumber || phoneNumber.length === 0 || name.length === 0) {
    return jsonWithError({ ok: false }, "Preencha todos os campos");
  }

  const unMaskedPhone = phoneNumber.replace(/\D/g, "");

  await prisma.lead.create({
    data: {
      id: createId(),
      name,
      phone: unMaskedPhone,
    },
  });

  return json({ ok: true });
}

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();

  if (loaderData.isTenant === false) {
    return (
      <>
        <Header />
        <main>
          <Hero />
          <PrimaryFeatures />
          <SecondaryFeatures />
          {/* <CallToAction /> */}
          {/* <Testimonials /> */}
          <Pricing />
          <Faqs />
        </main>
        <Footer />
      </>
    );
  }

  return <div></div>;
}
