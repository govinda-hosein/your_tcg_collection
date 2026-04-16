import { InferSchemaType, Model, Schema, model, models } from "mongoose";
import type { SetDocument } from "./set.model";

const imagesSchema = new Schema(
  {
    small: { type: String, required: true, trim: true },
    large: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const pokemonCardSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true, trim: true },
    setId: { type: String, required: true, index: true, trim: true },
    name: { type: String, required: true, trim: true },
    supertype: { type: String, required: true, trim: true },
    hp: { type: String, required: true, trim: true },
    types: {
      type: [{ type: String, trim: true }],
      required: true,
      validate: {
        validator: (value: string[]) => value.length > 0,
        message: "At least one Pokemon type is required.",
      },
    },
    convertedRetreatCost: { type: Number, required: true, min: 0 },
    number: { type: String, required: true, trim: true },
    rarity: { type: String, required: true, trim: true },
    regulationMark: { type: String, required: true, trim: true },
    images: { type: imagesSchema, required: true },
  },
  {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

pokemonCardSchema.virtual("set", {
  ref: "Set",
  localField: "setId",
  foreignField: "id",
  justOne: true,
});

export type PokemonCardDocument = InferSchemaType<typeof pokemonCardSchema>;
export type PokemonCardViewModel = Pick<
  PokemonCardDocument,
  "id" | "name" | "number" | "regulationMark" | "rarity" | "types" | "images"
> & {
  set?: Pick<SetDocument, "name">;
};
export type PokemonCardModelType = Model<PokemonCardDocument>;

const PokemonCardModel =
  (models.PokemonCard as PokemonCardModelType) ||
  model<PokemonCardDocument>("PokemonCard", pokemonCardSchema);

export default PokemonCardModel;
