import { NextRequest, NextResponse } from "next/server";
import { getStripePriceId, stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthenticatedUser } from "@/lib/supabase-server";
import { getRequestOrigin } from "@/lib/site-url";

export const runtime = "nodejs";

type StripeErrorLike = {
  code?: string;
  message?: string;
  param?: string;
  requestId?: string;
  type?: string;
};

function getStripeErrorDetails(error: unknown): StripeErrorLike {
  if (!error || typeof error !== "object") return {};

  const stripeError = error as StripeErrorLike;
  return {
    type: stripeError.type,
    code: stripeError.code,
    param: stripeError.param,
    message: stripeError.message,
    requestId: stripeError.requestId,
  };
}

function isMissingStripePriceError(error: unknown) {
  const details = getStripeErrorDetails(error);

  return (
    details.type === "StripeInvalidRequestError" &&
    details.code === "resource_missing" &&
    details.param === "line_items[0][price]"
  );
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { planId } = await req.json();

  let priceId: string | null;
  try {
    priceId = getStripePriceId(planId);
  } catch (error) {
    console.error("Stripe price configuration error:", error);
    return NextResponse.json(
      { error: "Server billing configuration error" },
      { status: 500 },
    );
  }

  if (!priceId)
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  try {
    const appOrigin = getRequestOrigin(req);
    const { data: existingSubscription } = await supabaseAdmin
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const existingCustomerId =
      typeof existingSubscription?.stripe_customer_id === "string"
        ? existingSubscription.stripe_customer_id
        : null;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      client_reference_id: user.id,
      ...(existingCustomerId
        ? { customer: existingCustomerId }
        : { customer_email: user.email ?? undefined }),
      metadata: { userId: user.id, planId },
      subscription_data: {
        metadata: { userId: user.id, planId },
      },
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appOrigin}/dashboard/settings?upgraded=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appOrigin}/plans`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (isMissingStripePriceError(error)) {
      console.error(
        "Stripe checkout price not found. Verify STRIPE_PRO_PRICE_ID and STRIPE_TEAM_PRICE_ID belong to the same Stripe account as STRIPE_SECRET_KEY.",
        getStripeErrorDetails(error),
      );
      return NextResponse.json(
        { error: "Server billing configuration error" },
        { status: 500 },
      );
    }

    console.error("Failed to create Stripe checkout session:", getStripeErrorDetails(error));
    return NextResponse.json(
      { error: "Unable to start checkout session" },
      { status: 500 },
    );
  }
}
