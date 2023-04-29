const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const appCheckVerification =
  require("./Middleware/AppCheck").appCheckVerification;
const verifyEveToken = require("./Middleware/eveTokenVerify").verifyEveToken;
const ESIMarketQuery = require("./sharedFunctions/priceData").ESIMarketQuery;
const checkAppVersion = require("./Middleware/appVersion").checkAppVersion;

admin.initializeApp();

const app = express();
const db = admin.firestore();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://eve-industry-planner-dev.firebaseapp.com",
      "https://www.eveindustryplanner.com",
      "https://eveindustryplanner.com",
    ],
    methods: "GET,POST",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);
app.use(express.json());
app.use(helmet());
// app.use(appCheckVerification);
app.use(checkAppVersion);

//Routes

//Generates JWT AuthToken
app.post("/auth/gentoken", verifyEveToken, async (req, res) => {
  if (req.body.UID === null) {
    functions.logger.warn("UID missing from request");
    functions.logger.info(`Header ${JSON.stringify(req.header)}`);
    functions.logger.info(`Body ${JSON.stringify(req.body)}`);
    return res.status(400).send("Malformed Request");
  }
  try {
    const authToken = await admin.auth().createCustomToken(req.body.UID);
    functions.logger.log(`${req.body.UID} Token Generated, Log In Successful`);
    return res.status(200).send({
      access_token: authToken,
    });
  } catch (error) {
    functions.logger.error("Error generating firebase auth token");
    functions.logger.error(error);
    return res
      .status(500)
      .send("Error generating auth token, contact admin for assistance");
  }
});

//Read Full Single Item Tranquilty
app.get("/item/:itemID", async (req, res) => {
  if (req.params.itemID === undefined) {
    return res.status(400).send("Item Data Missing From Request");
  }
  try {
    let document = db.collection("Items").doc(req.params.itemID);
    let product = await document.get();
    if (product.exists) {
      let response = product.data();
      functions.logger.log(
        `${req.params.itemID} Tranquilty Build Data Sent To ${req.header(
          "accountID"
        )} `
      );
      return res
        .status(200)
        .set("Cache-Control", "public, max-age=600, s-maxage=3600")
        .send(response);
    } else {
      functions.logger.error("Error retrieving item data");
      functions.logger.error(`Trying to retrieve ${req.params.itemID}`);
      functions.logger.error(error);
      return res
        .status(500)
        .send("Error retrieving item data, please try again.");
    }
  } catch (error) {
    functions.logger.error("Error retrieving item data");
    functions.logger.error(`Trying to retrieve ${req.params.itemID}`);
    functions.logger.error(error);
    return res
      .status(500)
      .send("Error retrieving item data, please try again.");
  }
});

app.post("/item", async (req, res) => {
  if (req.body.idArray === undefined) {
    return res.status(500).send("Item Data Missing From Request");
  }
  try {
    const returnArray = [];
    const missingIDs = [];
    const returnIDs = new Set(req.body.idArray);

    const promises = req.body.idArray.map((id) => {
      return db.collection("Items").doc(id.toString()).get();
    });

    const results = await Promise.all(promises);

    for (let i = 0; i < results.length; i++) {
      const doc = results[i];
      if (doc.exists) {
        const docData = doc.data();
        returnArray.push(docData);
      } else {
        missingIDs.push(req.body.idArray[i]);
        returnIDs.delete(req.body.idArray[i]);
      }
    }

    if (missingIDs.length > 0) {
      functions.logger.error(
        `${missingIDs.length} item/items missing: [${missingIDs}]`
      );
    }

    functions.logger.log(
      `${returnArray.length} items returned to ${req.header("accountID")}: [${[
        ...returnIDs,
      ]}]`
    );

    return res
      .status(200)
      .setHeader("Content-Type", "application/json")
      .send(returnArray);
  } catch (err) {
    functions.logger.error(err);
    return res
      .status(500)
      .send("Error retrieving item data, please try again.");
  }
});

//Read Full Single Item Singularity
app.get("/item/sisiData/:itemID", async (req, res) => {
  if (req.params.itemID === undefined) {
    return res.status(400).send("Item Data Missing From Request");
  }
  try {
    let document = db.collection("sisiItems").doc(req.params.itemID);
    let product = await document.get();
    if (product.exists) {
      let response = product.data();
      functions.logger.log(
        `${req.params.itemID} Singularity Build Data Sent To ${req.header(
          "accountID"
        )} `
      );
      return res.status(200).send(response);
    } else {
      functions.logger.error("Error retrieving item data");
      functions.logger.error(`Trying to retrieve ${req.params.itemID}`);
      functions.logger.error(error);
      return res
        .status(500)
        .send("Error retrieving item data, please try again.");
    }
  } catch (error) {
    functions.logger.error("Error retrieving item data");
    functions.logger.error(`Trying to retrieve ${req.params.itemID}`);
    functions.logger.error(error);
    return res
      .status(500)
      .send("Error retrieving item data, please try again.");
  }
});

app.post("/costs", async (req, res) => {
  if (req.body.idArray === undefined) {
    return res.status(500).send("Item Data Missing From Request");
  }

  try {
    const idArray = req.body.idArray;
    const pricingRef = admin.database().ref("market-prices");
    const missingDatabaseEntries = new Set();

    const promises = idArray.map(async (typeID) => {
      const itemRef = pricingRef.child(typeID.toString());
      const itemSnapshot = await itemRef.once("value");

      if (!itemSnapshot.exists()) {
        missingDatabaseEntries.add(typeID);
        return null;
      }

      return itemSnapshot.val();
    });

    const itemDataArray = await Promise.all(promises);
    const returnData = itemDataArray.filter((itemData) => itemData !== null);

    if (missingDatabaseEntries.size > 0) {
      const missingPromises = [...missingDatabaseEntries].map((id) =>
        ESIMarketQuery(id.toString(), true)
      );
      const missingData = await Promise.all(missingPromises);
      returnData.push(...missingData);
    }

    functions.logger.log(
      `${returnData.length} Prices Returned for ${req.header(
        "accountID"
      )}, [${idArray}]`
    );

    return res
      .status(200)
      .setHeader("Content-Type", "application/json")
      .send(returnData);
  } catch (err) {
    functions.logger.error(err);
    return res
      .status(500)
      .send("Error retrieving item data, please try again.");
  }
});

app.get("/systemindexes/:systemID", async (req, res) => {
  const systemID = +req.params.systemID;
  if (isNaN(systemID)) {
    return res.status(400).send("Invalid System ID");
  }
  const indexesRaw = await admin
    .storage()
    .bucket()
    .file("systemIndexes.json")
    .download();
  const indexesParsed = JSON.parse(indexesRaw);

  const systemIndex = indexesParsed.find(
    (index) => index.solar_system_id === systemID
  );
  if (!systemIndex) {
    return res.status(404).send("System Index Not Found");
  }

  res.send(systemIndex);
});

app.post("/systemindexes", async (req, res) => {
  const idArray = req.body.idArray;
  if (!Array.isArray(idArray)) {
    return res.status(400).send("System IDs must be an array");
  }

  const indexesRaw = await admin
    .storage()
    .bucket()
    .file("systemIndexes.json")
    .download();
  const indexesParsed = JSON.parse(indexesRaw);

  const systemIndexes = indexesParsed.filter((index) =>
    idArray.includes(index.solar_system_id)
  );

  res.send(systemIndexes);
});

//Export the api to Firebase Cloud Functions
exports.api = functions
  .region("europe-west1")
  .runWith({ maxInstances: 40 })
  .https.onRequest(app);
exports.buildUser = require("./Triggered Functions/Users");
exports.RefreshItemPrices = require("./Scheduled Functions/refreshItemPrices");
exports.RefreshSystemIndexes = require("./Scheduled Functions/refreshSystemIndexes");
exports.archivedJobProcess = require("./Scheduled Functions/archievedJobs");
exports.feedback = require("./Triggered Functions/storeFeedback");
exports.userClaims = require("./Triggered Functions/addCorpClaim");
exports.appVersion = require("./Triggered Functions/checkAppVersion");
exports.checkSDEUpdates = require("./Scheduled Functions/checkSDEUpdates");
