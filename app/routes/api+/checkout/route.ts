import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import Stripe from "stripe";

export async function action({ request, context }: ActionFunctionArgs) {
  const stripe = new Stripe(context.cloudflare.env.STRIPE_SECRET_KEY!);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "T-shirt",
            },
            unit_amount: 2000,
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${request.headers.get("origin")}/success`,
      cancel_url: `${request.headers.get("origin")}/cancel`,
    });

    return json({ id: session.id });
  } catch (err) {
    if (err instanceof Stripe.errors.StripeError) {
      return new Response(err.message, { status: err.statusCode });
    }
  }
}
