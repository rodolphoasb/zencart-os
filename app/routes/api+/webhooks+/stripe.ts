import { ActionFunctionArgs } from "@remix-run/cloudflare";
import Stripe from "stripe";

export async function action({ context, request }: ActionFunctionArgs) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  let event;

  const stripe = new Stripe(context.cloudflare.env.STRIPE_SECRET_KEY!);

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    if (err instanceof Stripe.errors.StripeError) {
      return new Response("Webhook Error: " + err.message, {
        status: err.statusCode,
      });
    }
  }

  if (event?.type == "payment_intent.succeeded") {
    console.log("Payment intent succeeded");
  }
}
