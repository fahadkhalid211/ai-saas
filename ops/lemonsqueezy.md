# Payments with Lemon Squeezy

Crescelo takes payments through Lemon Squeezy, which is the **merchant of record**: it charges the card, collects and pays the
sales tax / VAT, issues the invoice and hosts the customer portal. Stripe is no longer used anywhere.

The checkout links for the six plans (three plans, monthly and yearly) are built into `lib/billing/lemonsqueezy.ts`.
Everything below is what has to be set up on the Lemon Squeezy side and in the environment for a payment to reach a workspace.

## 1. Environment variables (Vercel and your own server)

| Variable | Needed | What it is |
|---|---|---|
| `LEMONSQUEEZY_WEBHOOK_SECRET` | **yes** | The signing secret of the webhook (step 2). Setting it switches checkout on. While it is empty, development uses a simulated checkout, and production refuses checkout (new workspaces get the no-card launch trial). |
| `LEMONSQUEEZY_API_KEY` | recommended | An API key (Settings, API). Used to give customers a fresh link to their portal and to switch a live subscription to another plan from inside the app. Without it the portal button opens Lemon Squeezy's general "my orders" page. |
| `LEMONSQUEEZY_VARIANT_STARTER`, `_GROWTH`, `_SCALE` and the same with `_ANNUAL` | recommended | The numeric **variant id** of each of the six variants (step 3). Lets the app tell exactly which plan was bought, and enables plan switching in the app. Without them the plan is read from the variant / product name, which must then contain "Starter", "Growth" or "Scale" / "Agency" (and "annual" or "yearly" for the yearly variants). |
| `LEMONSQUEEZY_CHECKOUT_<PLAN>` and `..._<PLAN>_ANNUAL` | no | Replace a built-in checkout link. Only `https://*.lemonsqueezy.com` links are accepted. |
| `ALLOW_LEMONSQUEEZY_TEST_MODE` | no | Set to `true` only to try test-mode purchases on a live server. Otherwise test-mode events are ignored in production so a test card can never start a real subscription. |

Remove `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` and `ALLOW_STRIPE_TEST_MODE` from Vercel; nothing reads them any more.

## 2. The webhook

Lemon Squeezy: Settings, Webhooks, **+**.

- **URL:** `https://www.crescelo.com/api/billing/webhook`
- **Signing secret:** a long random string; put the same value in `LEMONSQUEEZY_WEBHOOK_SECRET`.
- **Events:** `subscription_created`, `subscription_updated`, `subscription_cancelled`, `subscription_resumed`,
  `subscription_expired`, `subscription_paused`, `subscription_unpaused`, `subscription_payment_success`,
  `subscription_payment_failed`, `subscription_payment_recovered`, `order_refunded`.

The webhook is the only thing that gives a workspace a paid plan. Requests are verified with the HMAC-SHA256 signature in
`X-Signature`; a bad signature gets a 400.

## 3. The six variants

Each plan is one product variant: **Starter**, **Growth**, **Agency / Scale**, each monthly and yearly.

- **Trial:** to keep the 14-day free trial, set a 14-day trial on each variant (Product, Variant, "Free trial"). The app shows the
  trial from Lemon Squeezy's `on_trial` status and the trial end date it sends.
- **Redirect after purchase:** on each product, set the confirmation redirect to
  `https://www.crescelo.com/dashboard?billing_success=true`. The dashboard then waits for the webhook and opens the workspace.
- **Variant ids:** find them with `GET https://api.lemonsqueezy.com/v1/variants` (or in the dashboard URL of each variant) and put them
  in the `LEMONSQUEEZY_VARIANT_*` variables.
- **Customer portal:** Settings, Store, enable the customer portal so customers can change card, switch plan and cancel.

## 4. How it fits together

1. The owner clicks **Choose plan**. `POST /api/billing/checkout` answers with the plan's checkout link plus
   `checkout[custom][workspace_id]=<workspace>` and the billing e-mail.
2. The customer pays on Lemon Squeezy (trial first, if the variant has one).
3. Lemon Squeezy calls the webhook. The workspace is found by that custom `workspace_id` (not by the customer, because one customer can own
   several workspaces); the plan comes from the **variant Lemon Squeezy reports**, never from the link, so editing the link cannot buy a
   cheaper plan under a dearer name.
4. Later events keep status, trial end, cancellation and invoices in step. A cancelled subscription keeps working until the period that
   was paid for ends, then `subscription_expired` pauses the workspace.

Notes:

- A workspace that already has a live subscription is not taken over by a different subscription that names it in a link.
- Lemon Squeezy e-mails its own receipt and invoice for every payment, so the app sends none. The app still sends "trial started",
  "payment failed" and "cancelled" notices.
- Lemon Squeezy sends no "trial is about to end" event, so the app no longer sends that reminder itself. Turn on Lemon Squeezy's own
  trial reminder e-mails if you want one.
- There is no card fingerprint in Lemon Squeezy, so the old "one free trial per card" check is gone; the trial is once per workspace.
- Only the card brand and last four digits are stored, shown in Billing.

## 5. Trying it

1. In Lemon Squeezy turn on **Test mode**, create the variants there, and use `ALLOW_LEMONSQUEEZY_TEST_MODE=true` on a preview deployment.
2. Buy with the test card `4242 4242 4242 4242`.
3. Check the workspace shows the plan and trial in Billing, then cancel from the portal and see "cancels at period end".
4. Switch Test mode off, set `ALLOW_LEMONSQUEEZY_TEST_MODE` back to empty, and use the live variants.
