import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const configSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    value: { type: String, required: true, trim: true },
  },
  {
    versionKey: false,
  },
);

export type ConfigDocument = InferSchemaType<typeof configSchema>;
export type ConfigModelType = Model<ConfigDocument>;

const ConfigModel =
  (models.Config as ConfigModelType) ||
  model<ConfigDocument>("Config", configSchema);

export default ConfigModel;
