import clsx from "clsx";
import { AlarmClockIcon } from "lucide-react";
import posthog from "posthog-js";
import { Button2 } from "~/components/ui/button2";
import { Container } from "./Container";
import { cn } from "~/utils";

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
  pretext,
  featured = false,
  exclusiveDiscount = false,
}: {
  name?: string;
  price: string;
  description: string;
  href: string;
  features: Array<string>;
  featured?: boolean;
  pretext: string;
  exclusiveDiscount?: boolean;
}) {
  return (
    <section
      className={clsx(
        "flex flex-col rounded-3xl px-6 border py-8  sm:px-8",
        featured ? " bg-white shadow-lg" : "shadow"
      )}
    >
      <div className="flex w-full flex-col items-center justify-center">
        <p className="font-normal mb-2">{pretext}</p>
        <p
          className={cn(
            featured && "text-5xl font-bold tracking-tight text-orange-500",
            !featured &&
              "text-4xl font-semibold tracking-tight text-neutral-900"
          )}
        >
          {price}
        </p>
      </div>
      {name ? (
        <h3 className="mt-5 text-lg font-medium text-black">{name}</h3>
      ) : null}

      {description ? (
        <p
          className={clsx(
            "mt-2 text-base",
            featured ? "text-black" : "text-neutral-600"
          )}
        >
          {description}
        </p>
      ) : null}

      {exclusiveDiscount ? (
        <div className="mt-6 flex w-full justify-center">
          <div className="w-full rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 p-[1.5px]">
            <div className="flex w-full items-center justify-center gap-x-4 rounded-full bg-white p-4">
              <AlarmClockIcon className="h-5 w-5 text-orange-500" />
              <p className="text-center text-xs font-medium sm:text-sm">
                Exclusive discount for the first 100 purchases.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <ul
        className={clsx(
          "order-last mt-10 flex flex-col gap-y-3 text-sm",
          featured ? "text-black" : "text-neutral-600"
        )}
      >
        {features.map((feature) => (
          <li key={feature} className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              className="h-5 w-5 shrink-0 text-[#00D632]"
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
        color={featured ? "orange" : "white"}
        className="mt-8 text-xl"
        aria-label={`Start`}
        onClick={() => {
          posthog.capture("clicked_buy_now");
        }}
      >
        Start
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
          <h2 className="font-semibold text-3xl tracking-tight text-neutral-900 sm:text-4xl md:text-5xl">
            The simplest pricing on the market.
          </h2>
        </div>
        <div className="mt-16 flex flex-col gap-y-8 sm:gap-y-0 sm:flex-row gap-x-8 w-full justify-center">
          <Plan
            price="Free"
            description="No fees, commissions, or monthly charges."
            pretext="Get Started for"
            href="/login"
            features={[
              "Upload up to 25 images",
              "Unlimited orders on WhatsApp",
              "Time-saving in customer service",
              "Link for Instagram bio",
              "Your catalog ready in minutes",
              "Access via computer or mobile",
              "New features every month",
            ]}
          />
          <Plan
            featured
            name="Lifetime Plan"
            price="$149"
            description="No fees, commissions, or monthly charges."
            pretext="Only"
            href="/login"
            exclusiveDiscount
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
