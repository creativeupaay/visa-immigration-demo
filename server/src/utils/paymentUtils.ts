import Stripe from 'stripe';
import {LeadModel} from "../leadModels/leadModel"
import { Types } from 'mongoose';

// instance of Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2025-04-30.basil', // new Basil SDK version (version compatability issue aa sakte hai)
});
// secret key from dashboard



export async function createPaymentLink(
    leadId: string | Types.ObjectId,
    amount: number,
    currency: string
  ): Promise<string> {

    // 1. Fetch lead document
    const lead = await LeadModel.findById(leadId).lean();
    if (!lead) {
      throw new Error(`Lead with ID ${leadId} not found.`);
    }
  
    // 2. Create product
    const product = await stripe.products.create({
      name: `Visa Consultation for ${lead.fullName}`,
    });
  
    // 3. Create price
    const price = await stripe.prices.create({
      unit_amount: amount * 100, // Convert to smallest unit (e.g., paisa or cents)
      currency,
      product: product.id,
    });
  
    // 4. Create payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      metadata: {
        leadId: lead._id.toString(),
        email: lead.email,
      },
    });
  
    console.log('Payment Link:', paymentLink.url);
    return paymentLink.url;
}





export async function createPaymentSession(
  productName:string,
  metadata: any,
  amount: number,
  currency: string
): Promise<string> {

  // 2. Create Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',

    line_items: [
      {
        price_data: {
          currency,
          unit_amount: amount * 100, // amount in paisa
          product_data: {
            name: productName,
          },
        },
        quantity: 1,
      },
    ],

    // 3. URLs after success or cancel
    // success_url: 'https://yourdomain.com/payment-success?session_id={CHECKOUT_SESSION_ID}',
    success_url : "https://app.e360consult.com",
    cancel_url: 'https://app.e360consult.com',

    // 4. Metadata you want to receive back in webhook
    payment_intent_data: {
      metadata: metadata,
    },

    // Optional: Add to session metadata too
    metadata: metadata,
  });

  console.log('Checkout Session URL:', session.url);
  return session.url!;
}




















// const paymentLink = await stripe.paymentLinks.create({
//   line_items: [
//     {
//       price_data: {
//         currency: "inr",
//         product_data: {
//           name: `Visa Consultation for ${lead.fullName.first} ${lead.fullName.last}`,
//         },
//         unit_amount: amount * 100,  // stripe needs amount in paisa
//       },
//       quantity: 1,
//     },
//   ]as Stripe.Checkout.SessionCreateParams.LineItem[],
//   metadata: {
//     leadId: leadId,
//     email: lead.email,
//   },
// });





// Actually stripe.paymentLinks.create() returns an object like this:-->>
// {
//     id: 'plink_1PQRStuvWXYZ1234',
//     object: 'payment_link',
//     url: 'https://pay.stripe.com/abc123xyz',
//     ...otherFields
//   }
  