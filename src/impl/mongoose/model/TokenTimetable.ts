import mongoose, { ObjectId, Schema } from "mongoose";

import { ITokenTimetable } from "../../../db/model/ITokenTimetable";

const tokenTimetableSchema = new Schema<ITokenTimetable<ObjectId>>(
  {
    tokens: { default: 0, required: true, type: Number },
    userId: {
      ref: "User",
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export default mongoose.model("ITokenTimetable", tokenTimetableSchema);
