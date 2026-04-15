import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const setSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true, trim: true },
    name: { type: String, required: true, trim: true },
    series: { type: String, required: true, trim: true },
    printedTotal: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    ptcgoCode: { type: String, required: true, trim: true },
    releaseDate: {
      type: String,
      required: true,
      match: /^\d{4}\/\d{2}\/\d{2}$/,
    },
    updatedAt: {
      type: String,
      required: true,
      match: /^\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2}$/,
    },
  },
  {
    versionKey: false,
  },
);

export type SetDocument = InferSchemaType<typeof setSchema>;
export type SetModelType = Model<SetDocument>;

const SetModel =
  (models.Set as SetModelType) || model<SetDocument>("Set", setSchema);

export default SetModel;
