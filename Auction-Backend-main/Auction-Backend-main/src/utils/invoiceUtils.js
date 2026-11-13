import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const getInvoicePdfUrl = async (subscription) => {
  if (!subscription?.latest_invoice) return null;

  try {
    const invoiceId = typeof subscription.latest_invoice === 'string' 
      ? subscription.latest_invoice 
      : subscription.latest_invoice?.id;

    if (!invoiceId) return null;

    const invoice = await stripe.invoices.retrieve(invoiceId, {
      expand: ['subscription']
    });

    if (invoice.subscription?.metadata?.totalMonthsCommitment) {
      if (!invoice.metadata?.planDuration) {
        await stripe.invoices.update(invoice.id, {
          metadata: {
            ...invoice.metadata,
            planDuration: invoice.subscription.metadata.totalMonthsCommitment,
            subscriptionId: invoice.subscription.id
          }
        });
      }
    }

    return invoice.invoice_pdf || null;
  } catch (err) {
    console.error("Invoice PDF fetch error:", err.message);
    return null;
  }
};