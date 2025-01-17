import { getFirestore } from "firebase-admin/firestore";
import { error } from "firebase-functions/logger";
import { doc, getDoc } from "firebase/firestore";

async function retrieveItemRecipe(req, res) {
  try {
    const db = getFirestore();

    const { itemID } = req.params;
    if (!itemID) {
      return res.status(400).send("Item Data Missing From Request");
    }
    const docSnap = await getDoc(doc(db, "Items", itemID));

    if (docSnap.exists()) {
      const response = docSnap.data();
      return res
        .status(200)
        .set("Cache-Control", "public, max-age=1800, s-maxage=3600")
        .send(response);
    } else {
      error("Error retrieving item data");
      error(`Trying to retrieve ${itemID}`);
      return res
        .status(500)
        .send("Error retrieving item data, please try again.");
    }
  } catch (err) {
    error("Error retrieving item data");
    error(`Trying to retrieve ${req.params.itemID}`);
    error(err);
    return res
      .status(500)
      .send("Error retrieving item data, please try again.");
  }
}

export default retrieveItemRecipe;
