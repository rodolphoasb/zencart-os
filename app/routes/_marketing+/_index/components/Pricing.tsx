import clsx from "clsx";
import { AlarmClockIcon } from "lucide-react";
import posthog from "posthog-js";
import { Button2 } from "~/components/ui/button2";
import { Container } from "./Container";

// function SwirlyDoodle(props: React.ComponentPropsWithoutRef<"svg">) {
//   return (
//     <svg
//       aria-hidden="true"
//       viewBox="0 0 281 40"
//       preserveAspectRatio="none"
//       {...props}
//     >
//       <path
//         fillRule="evenodd"
//         clipRule="evenodd"
//         d="M240.172 22.994c-8.007 1.246-15.477 2.23-31.26 4.114-18.506 2.21-26.323 2.977-34.487 3.386-2.971.149-3.727.324-6.566 1.523-15.124 6.388-43.775 9.404-69.425 7.31-26.207-2.14-50.986-7.103-78-15.624C10.912 20.7.988 16.143.734 14.657c-.066-.381.043-.344 1.324.456 10.423 6.506 49.649 16.322 77.8 19.468 23.708 2.65 38.249 2.95 55.821 1.156 9.407-.962 24.451-3.773 25.101-4.692.074-.104.053-.155-.058-.135-1.062.195-13.863-.271-18.848-.687-16.681-1.389-28.722-4.345-38.142-9.364-15.294-8.15-7.298-19.232 14.802-20.514 16.095-.934 32.793 1.517 47.423 6.96 13.524 5.033 17.942 12.326 11.463 18.922l-.859.874.697-.006c2.681-.026 15.304-1.302 29.208-2.953 25.845-3.07 35.659-4.519 54.027-7.978 9.863-1.858 11.021-2.048 13.055-2.145a61.901 61.901 0 0 0 4.506-.417c1.891-.259 2.151-.267 1.543-.047-.402.145-2.33.913-4.285 1.707-4.635 1.882-5.202 2.07-8.736 2.903-3.414.805-19.773 3.797-26.404 4.829Zm40.321-9.93c.1-.066.231-.085.29-.041.059.043-.024.096-.183.119-.177.024-.219-.007-.107-.079ZM172.299 26.22c9.364-6.058 5.161-12.039-12.304-17.51-11.656-3.653-23.145-5.47-35.243-5.576-22.552-.198-33.577 7.462-21.321 14.814 12.012 7.205 32.994 10.557 61.531 9.831 4.563-.116 5.372-.288 7.337-1.559Z"
//       />
//     </svg>
//   );
// }

function Plan({
  name,
  price,
  description,
  href,
  features,
  featured = false,
}: {
  name: string;
  price: string;
  description: string;
  href: string;
  features: Array<string>;
  featured?: boolean;
}) {
  return (
    <section
      className={clsx(
        "flex flex-col rounded-3xl px-6 shadow-xl sm:px-8",
        featured ? " bg-white py-8" : "lg:py-8"
      )}
    >
      <div className="flex w-full flex-col items-center justify-center">
        <p className="font-semibold">Apenas 12x de</p>
        <p className="text-5xl font-bold tracking-tight text-orange-500">
          {price}
        </p>
        <p className="text-sm">ou R$ 597 à vista no Pix</p>
      </div>
      <h3 className="mt-5 text-lg font-medium text-black">{name}</h3>
      <p
        className={clsx(
          "mt-2 text-base",
          featured ? "text-black" : "text-slate-400"
        )}
      >
        {description}
      </p>

      <div className="mt-6 flex w-full justify-center">
        <div className="w-full rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 p-[1.5px]">
          <div className="flex w-full items-center justify-center gap-x-4 rounded-full bg-white p-4">
            <AlarmClockIcon className="h-5 w-5 text-orange-500" />
            <p className="text-center text-xs font-medium sm:text-sm">
              Desconto exclusivo para as 100 primeiras compras.
            </p>
          </div>
        </div>
      </div>

      <ul
        className={clsx(
          "order-last mt-10 flex flex-col gap-y-3 text-sm",
          featured ? "text-black" : "text-slate-200"
        )}
      >
        {features.map((feature) => (
          <li key={feature} className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              className="h-5 w-5 text-green-400"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              ></path>
            </svg>
            <span className="ml-4">{feature}</span>
          </li>
        ))}
      </ul>
      <Button2
        href={href}
        color="orange"
        className="mt-8"
        aria-label={`Começar agora com o plano vitalício por R$ 597.`}
        rel="noopener noreferrer"
        target="_blank"
        onClick={() => {
          posthog.capture("clicked_buy_now");
        }}
      >
        Começar agora
      </Button2>
    </section>
  );
}

export function Pricing() {
  return (
    <section
      id="pricing"
      aria-label="Pricing"
      className="bg-gray-50 py-20 sm:py-24"
    >
      <Container>
        <div className="md:text-center">
          <h2 className="  text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            O preço mais simples do mercado.
          </h2>
          <p className="mt-4 text-lg text-gray-800">
            Você paga uma vez e é seu pra sempre. Simples assim. <br /> Não
            gostou? Devolvemos todo seu dinheiro nos 7 primeiros dias.
          </p>
        </div>
        <div className="mt-16 flex w-full justify-center">
          <Plan
            featured
            name="Lifetime Plan"
            price="R$ 59,90"
            description="No fees, commissions, or monthly charges."
            href="https://pay.kiwify.com.br/ybcO2sO"
            features={[
              "Unlimited products (Limit of 1000 photos per store)",
              "Time-saving in customer service",
              "Link for Instagram bio",
              "Your catalog ready in minutes",
              "Access via computer or mobile",
              "Unlimited orders on WhatsApp",
              "New features every month",
            ]}
          />
        </div>
      </Container>
    </section>
  );
}
