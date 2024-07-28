import { UserError } from "../../util/error";
import connectCollection from "../database/mongo";

interface AddItem {
  title: string;
  description: string;
  price: number;
  properties: { [key: string]: any };
}

export default async function addItem(item: AddItem) {
  const coll = await connectCollection("items");

  if (item.properties) {
    const keys = 
  }
}
