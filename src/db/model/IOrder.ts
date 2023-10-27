import { BaseEntity } from "./BaseEntity";
import { OfferCycle } from "./IOffer";
import { MinimalId } from "./MinimalId";

export interface OrderStatus {
  date: Date;
  message: string;
  status: "pending" | "paid" | "refused" | "error";
}

/**
 * @param K the type of foreign keys (is used for all foreign keys type)
 */
export interface IOrder<K extends MinimalId> extends BaseEntity<K> {
  country: string | null;
  createdAt: Date;
  currency: string;
  customCycle: number | null;
  cycle: OfferCycle;
  history: [OrderStatus] | null;
  /** Check documentation in @IOffer */
  offerGroup: string;
  offerId: K;
  /**
   * This field value can change if an intent is abandoned: a new intent can be created to complete the payment.
   */
  paymentIntentId: string | null;
  /**
   * This field is not saved to db, it only carries info during the session
   */
  paymentIntentSecret: string | null;
  quantity: number;
  status: "pending" | "paid" | "refused" | "error";
  taxRate: number | null;
  tokenCount: number | null;
  total: number;
  updatedAt: Date;
  userId: K;
}
