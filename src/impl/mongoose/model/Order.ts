import mongoose, { Model, ObjectId, Schema } from "mongoose";

import { IOrder, OrderStatus } from "../../../db/model/IOrder";

export type IMongooseOrder = IOrder<ObjectId>;

const orderStatusSchema = new Schema<OrderStatus>({
  date: Date,
  message: String,
  status: {
    enum: ["pending", "paid", "refused"],
    required: true,
    type: String,
  },
});

const orderSchema = new Schema<IMongooseOrder>(
  {
    history: [orderStatusSchema],
    offerId: {
      ref: "IOffer",
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
    status: {
      enum: ["pending", "paid", "refused"],
      required: true,
      type: String,
    },
    tokenCount: { required: true, type: Number },
    userId: {
      ref: "User",
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true },
);

export default mongoose.model("order", orderSchema) as Model<IMongooseOrder>;
