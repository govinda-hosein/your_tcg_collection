import { InferSchemaType, Model, Schema, model, models } from "mongoose";

import { PokemonCardDocument } from "./pokemonCard.model";
import { SetDocument } from "./set.model";

const ownedCardSchema = new Schema(
  {
    cardId: { type: String, required: true, trim: true, index: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

ownedCardSchema.virtual("card", {
  ref: "PokemonCard",
  localField: "cardId",
  foreignField: "id",
  justOne: true,
});

export type OwnedCardDocument = InferSchemaType<typeof ownedCardSchema>;
export type OwnedCardModelType = Model<OwnedCardDocument>;
export type CardCondition =
  | "Mint"
  | "Near Mint"
  | "Excellent"
  | "Good"
  | "Played"
  | "Poor";

export type OwnedCardViewModel = Pick<OwnedCardDocument, "quantity"> & {
  id: PokemonCardDocument["id"];
  name: PokemonCardDocument["name"];
  set: SetDocument["name"] | "Unknown Set";
  number: PokemonCardDocument["number"];
  rarity: PokemonCardDocument["rarity"];
  regulationMark: PokemonCardDocument["regulationMark"];
  condition: CardCondition;
  images?: PokemonCardDocument["images"];
  type?: PokemonCardDocument["types"][number];
};

const OwnedCardModel =
  (models.OwnedCard as OwnedCardModelType) ||
  model<OwnedCardDocument>("OwnedCard", ownedCardSchema);

export default OwnedCardModel;
