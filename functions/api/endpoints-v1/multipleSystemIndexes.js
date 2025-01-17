import { getDatabase } from "firebase-admin/database";
import { error, log } from "firebase-functions/logger";
import { get, ref } from "firebase/database";
import buildMissingSystemIndexValue from "../../sharedFunctions/misingSystemIndexValue.js";

async function retrieveMultipleSystemIndexes(req, res) {
  try {
    const db = getDatabase();

    const { idArray } = req.body;

    if (!idArray || !Array.isArray(idArray) || idArray.length === 0) {
      return res.status(400).send("Invalid or empty ID array");
    }

    const results = {};

    const databaseRequests = idArray.map((id) =>
      get(ref(db, `live-data/system-indexes/${id}`))
    );

    const databaseResponses = await Promise.all(databaseRequests);

    for (let itemReturn of databaseResponses) {
      const itemData = itemReturn.val();
      if (itemData !== null) {
        results[itemData.solar_system_id] = itemData;
      }
    }

    idArray.forEach((i) => {
      if (!results[i]) {
        results[i] = buildMissingSystemIndexValue(i);
      }
    });

    const returnData = Object.values(results);

    log(
      `${returnData.length} System Indexes Returned For ${req.header(
        "accountID"
      )}, [${idArray}]`
    );

    return res
      .status(200)
      .setHeader("Content-Type", "application/json")
      .send(returnData);
  } catch (err) {
    error(err.message);
    return res
      .status(500)
      .send("Error retrieving system data, please try again.");
  }
}

export default retrieveMultipleSystemIndexes;
