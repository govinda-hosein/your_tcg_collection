import { InferSchemaType, Model, Schema, model, models } from "mongoose";

import { PokemonCardDocument } from "./pokemonCard.model";
import { SetDocument } from "./set.model";

const ownedCardSchema = new Schema(
  {
    cardId: { type: String, required: true, trim: true, index: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, min: 0, default: 1 },
    cardCondition: {
      type: String,
      default: "Mint",
    },
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

export type OwnedCardViewModel = Pick<
  OwnedCardDocument,
  "cardId" | "quantity" | "price" | "cardCondition"
> & {
  card: Pick<
    PokemonCardDocument,
    "id" | "name" | "number" | "rarity" | "types" | "images" | "artist"
  > & {
    set?: Pick<SetDocument, "name">;
  };
};

const OwnedCardModel =
  (models.OwnedCard as OwnedCardModelType) ||
  model<OwnedCardDocument>("OwnedCard", ownedCardSchema);

export default OwnedCardModel;
