import Stripe from "stripe";

import { IOrder } from "../../db/model";
import { OrderStatus } from "../../db/model/IOrder";
import { PaymentError } from "../../errors";
import { IConfigReader } from "../../service/config/IConfigReader";
import { IPaymentClient } from "../../service/IPaymentClient";
import { ObjectId } from "../mongoose/TypeDefs";

/**
 * This class abstracts out all stripe-specific objects by handling both calls to the stripe endpoint, and webhooks parsing. Results will be in the format of this project interfaces.
 * Docs for stripe: https://stripe.com/docs/payments/accept-a-payment?ui=elements
 *
 * Handling abandoned or incomplete payment intents in Stripe can be a complex task, especially if you can't store the client_secret on the server.
 * The strategy is then to store the order, and create new intents if the payment failed or was abandoned.
 * The IOrder.paymentIntentId is therefore a value that can change as long as the status is not "paid"
 */
export class StripeClient implements IPaymentClient<ObjectId> {
  private readonly stripe: Stripe;
  private readonly currency: string;

  constructor(configReader: IConfigReader) {
    this.stripe = new Stripe(configReader.paymentSecretKey(), {
      apiVersion: configReader.paymentApiVersion()
    });
    this.currency = configReader.currency();
  }

  async createPaymentIntent(
    order: IOrder<ObjectId>
  ): Promise<IOrder<ObjectId> | null> {
    try {
      const intent = await this.stripe.paymentIntents.create({
        amount: order.total * 100, // 'amount' represents the amount in cents
        currency: this.currency, // Replace with your desired currency
        description: `Payment for Order #${
          order._id
        } created ${new Date().toDateString()}` // Modify as needed
      });

      // Update the order object with paymentIntentId
      order.paymentIntentId = intent.id;
      order.paymentIntentSecret = intent.client_secret;

      // Return the updated order
      return order;
    } catch (error) {
      // Handle and translate the error
      throw new PaymentError("Error creating payment intent", error);
    }
  }

  /**
   * Execute the payment using the paymentIntentId.
   * This will be called by the client after an execute has been called by Stripe Elements. It will just notify the client of the status. Webhooks are another channel to do the same thing if the client session was interrupted.
   * https://stripe.com/docs/payments/accept-a-payment?ui=elements
   *
   * If you want to implement more complex cases, your can override this method and call confirmPayment by yourself, handling redirects and other needed actions.
   * Docs for that are here https://stripe.com/docs/api/payment_intents/confirm
   *
   * @param order the order containing intent information
   */
  async executePayment(
    order: IOrder<ObjectId>
  ): Promise<IOrder<ObjectId> | null> {
    try {
      // Assuming you have the paymentIntentId stored in the order
      if (!order.paymentIntentId) {
        throw new PaymentError("No payment intent was created for this order");
      }

      // Retrieve the payment intent from Stripe
      const intent = await this.stripe.paymentIntents.retrieve(
        order.paymentIntentId
      );

      // Update the order status based on the payment intent status
      switch (intent.status) {
        case "succeeded":
          // Payment is successful
          order.status = "paid";
          // Create a payment status entry in the order's history
          this.addHistoryItem(order, {
            message: "Payment succeeded",
            status: "paid"
          } as OrderStatus);
          break;

        case "requires_payment_method":
          // Handle payment failure due to payment method issues
          order.status = "refused";
          // Create a payment status entry in the order's history
          this.addHistoryItem(order, {
            message: "Payment method issues",
            status: "refused"
          } as OrderStatus);
          break;

        case "requires_action":
          order.status = "error";
          // Create a payment status entry in the order's history
          this.addHistoryItem(order, {
            message:
              "Payment requires an action we don't handle: " +
              intent.next_action,
            status: "error"
          } as OrderStatus);
          break;

        // Handle other payment intent statuses as needed
      }

      // Return the updated order
      return order;
    } catch (error) {
      // Handle and translate the error
      throw new PaymentError("Error executing payment", error);
    }
  }

  private addHistoryItem(order: IOrder<ObjectId>, historyItem: OrderStatus) {
    if (!order.history) {
      order.history = [];
    }
    historyItem.date = historyItem.date ?? new Date();

    order.history.push(historyItem);
  }

  // Handle webhook callbacks
  handleWebhook(eventPayload: any, webhookSecret: string): Stripe.Event {
    const signature = eventPayload.headers["stripe-signature"];

    try {
      const event = this.stripe.webhooks.constructEvent(
        eventPayload.body,
        signature,
        webhookSecret
      );
      return event;
    } catch (error) {
      // Handle and translate the error
      throw new PaymentError("Error handling webhook event", error);
    }
  }

  async checkUserBalance(userId: string): Promise<number> {
    try {
      // Fetch user balance, you may need to implement this part
      const balance = await this.fetchUserBalance(userId);
      return balance;
    } catch (error) {
      // Handle and translate the error
      throw new PaymentError("Error checking user balance", error);
    }
  }

  // Implement this method to fetch the user's balance from Stripe
  async fetchUserBalance(userId: string): Promise<number> {
    try {
      // Fetch user balance from Stripe
      // Implement the logic here
      return 1000; // Example balance
    } catch (error) {
      // Handle and translate the error
      throw new PaymentError("Error fetching user balance", error);
    }
  }
}
