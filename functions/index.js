// const functions = require("firebase-functions");
// const admin = require("firebase-admin");
// const express = require("express");
// const helmet = require("helmet");
// const cors = require("cors");
// const { appCheckVerification } = require("./Middleware/AppCheck");
// const { verifyEveToken } = require("./Middleware/eveTokenVerify");
// const { ESIMarketQuery } = require("./sharedFunctions/fetchMarketPrices");
// const {
//   ESIMarketHistoryQuery,
// } = require("./sharedFunctions/fetchMarketHistory");
// const { checkAppVersion } = require("./Middleware/appVersion");
// const { GLOBAL_CONFIG } = require("./global-config-functions");
// const {
//   BuildMissingSystemIndexValue,
// } = require("./sharedFunctions/misingSystemIndexValue");

// const { DEFAULT_MARKET_LOCATIONS } = GLOBAL_CONFIG;

// admin.initializeApp();

// const app = express();
// const db = admin.firestore();

// app.use(
//   cors({
//     origin: [
//       "http://localhost:3000",
//       "https://eve-industry-planner-dev.firebaseapp.com",
//       "https://www.eveindustryplanner.com",
//       "https://eveindustryplanner.com",
//     ],
//     methods: "GET,POST",
//     preflightContinue: false,
//     optionsSuccessStatus: 204,
//   })
// );
// app.use(express.json());
// app.use(helmet());
// app.use(appCheckVerification);
// app.use(checkAppVersion);

// //Routes

// //Generates JWT AuthToken
// app.post("/auth/gentoken", verifyEveToken, async (req, res) => {
//   if (req.body.UID === null) {
//     functions.logger.warn("UID missing from request");
//     functions.logger.info(`Header ${JSON.stringify(req.header)}`);
//     functions.logger.info(`Body ${JSON.stringify(req.body)}`);
//     return res.status(400).send("Malformed Request");
//   }
//   try {
//     const authToken = await admin.auth().createCustomToken(req.body.UID);
//     functions.logger.log(`FB Auth Token Generated - ${req.body.UID}`);
//     return res.status(200).send({
//       access_token: authToken,
//     });
//   } catch (error) {
//     functions.logger.error("Error generating firebase auth token");
//     functions.logger.error(error);
//     return res
//       .status(500)
//       .send("Error generating auth token, contact admin for assistance");
//   }
// });

// //Read Full Single Item Tranquilty
// app.get("/item/:itemID", async (req, res) => {
//   try {
//     const { itemID } = req.params;
//     if (!itemID) {
//       return res.status(400).send("Item Data Missing From Request");
//     }
//     let document = db.collection("Items").doc(itemID);
//     let product = await document.get();
//     if (product.exists) {
//       let response = product.data();
//       functions.logger.log(
//         `${itemID} Tranquilty Build Data Sent To ${req.header("accountID")} `
//       );
//       return res
//         .status(200)
//         .set("Cache-Control", "public, max-age=1800, s-maxage=3600")
//         .send(response);
//     } else {
//       functions.logger.error("Error retrieving item data");
//       functions.logger.error(`Trying to retrieve ${itemID}`);
//       functions.logger.error(error);
//       return res
//         .status(500)
//         .send("Error retrieving item data, please try again.");
//     }
//   } catch (error) {
//     functions.logger.error("Error retrieving item data");
//     functions.logger.error(`Trying to retrieve ${req.params.itemID}`);
//     functions.logger.error(error);
//     return res
//       .status(500)
//       .send("Error retrieving item data, please try again.");
//   }
// });

// app.post("/item", async (req, res) => {
//   try {
//     const { idArray } = req.body;
//     if (!idArray || !Array.isArray(idArray) || idArray.length === 0) {
//       return res.status(400).send("Invalid or empty ID array");
//     }
//     const returnArray = [];
//     const missingIDs = [];
//     const returnIDs = new Set(req.body.idArray);

//     const promises = req.body.idArray.map((id) => {
//       return db.collection("Items").doc(id.toString()).get();
//     });

//     const results = await Promise.all(promises);

//     for (let i = 0; i < results.length; i++) {
//       const doc = results[i];
//       if (doc.exists) {
//         const docData = doc.data();
//         returnArray.push(docData);
//       } else {
//         missingIDs.push(req.body.idArray[i]);
//         returnIDs.delete(req.body.idArray[i]);
//       }
//     }

//     if (missingIDs.length > 0) {
//       functions.logger.error(
//         `${missingIDs.length} item/items missing: [${missingIDs}]`
//       );
//     }

//     functions.logger.log(
//       `${returnArray.length} items returned to ${req.header("accountID")}: [${[
//         ...returnIDs,
//       ]}]`
//     );

//     return res
//       .status(200)
//       .setHeader("Content-Type", "application/json")
//       .send(returnArray);
//   } catch (err) {
//     functions.logger.error(err);
//     return res
//       .status(500)
//       .send("Error retrieving item data, please try again.");
//   }
// });

// //Read Full Single Item Singularity
// app.get("/item/sisiData/:itemID", async (req, res) => {
//   if (req.params.itemID === undefined) {
//     return res.status(400).send("Item Data Missing From Request");
//   }
//   try {
//     let document = db.collection("sisiItems").doc(req.params.itemID);
//     let product = await document.get();
//     if (product.exists) {
//       let response = product.data();
//       functions.logger.log(
//         `${req.params.itemID} Singularity Build Data Sent To ${req.header(
//           "accountID"
//         )} `
//       );
//       return res.status(200).send(response);
//     } else {
//       functions.logger.error("Error retrieving item data");
//       functions.logger.error(`Trying to retrieve ${req.params.itemID}`);
//       functions.logger.error(error);
//       return res
//         .status(500)
//         .send("Error retrieving item data, please try again.");
//     }
//   } catch (error) {
//     functions.logger.error("Error retrieving item data");
//     functions.logger.error(`Trying to retrieve ${req.params.itemID}`);
//     functions.logger.error(error);
//     return res
//       .status(500)
//       .send("Error retrieving item data, please try again.");
//   }
// });

// app.post("/market-data", async (req, res) => {
//   try {
//     const { idArray: requestedIDS } = req.body;
//     if (
//       !requestedIDS ||
//       !Array.isArray(requestedIDS) ||
//       requestedIDS.length === 0
//     ) {
//       return res.status(400).send("Invalid or empty ID array");
//     }

//     const databaseMarketPricesQueryPromises = requestedIDS.map((id) =>
//       admin.database().ref(`live-data/market-prices/${id}`).once("value")
//     );
//     const databaseMarketHistoryQueryPromises = requestedIDS.map((id) =>
//       admin.database().ref(`live-data/market-history/${id}`).once("value")
//     );
//     const databaseAdjustedPricesQueryPromises = requestedIDS.map((id) =>
//       admin.database().ref(`live-data/adjusted-prices/${id}`).once("value")
//     );

//     const databaseMarketPricesQueryResolves = await Promise.all(
//       databaseMarketPricesQueryPromises
//     );
//     const databaseMarketHistoryQueryResolves = await Promise.all(
//       databaseMarketHistoryQueryPromises
//     );
//     const databaseAdjustedPricesQueryResolves = await Promise.all(
//       databaseAdjustedPricesQueryPromises
//     );

//     const { returnData: databaseResults, missingData: missingIDs } =
//       meregeReturnPromises(
//         requestedIDS,
//         databaseMarketPricesQueryResolves,
//         databaseMarketHistoryQueryResolves,
//         databaseAdjustedPricesQueryResolves,
//         true
//       );

//     const missingPricePromises = missingIDs.map((id) =>
//       ESIMarketQuery(id.toString())
//     );
//     const missingHistoryPromises = missingIDs.map((id) =>
//       ESIMarketHistoryQuery(id.toString())
//     );

//     const missingPriceResolves = await Promise.all(missingPricePromises);
//     const missingHistoryResolves = await Promise.all(missingHistoryPromises);

//     const { returnData: esiResults, missingData: failedToRetrieve } =
//       meregeReturnPromises(
//         missingIDs,
//         missingPriceResolves,
//         missingHistoryResolves,
//         databaseAdjustedPricesQueryResolves,
//         false
//       );

//     const returnData = [...databaseResults, ...esiResults];

//     functions.logger.log(
//       `${returnData.length} Market Objects Returned for ${req.header(
//         "accountID"
//       )}, [${requestedIDS}]`
//     );

//     if (failedToRetrieve.length > 0) {
//       functions.logger.warn(
//         `${failedToRetrieve.length} Market Objects Could Not Be Found`
//       );
//     }

//     function meregeReturnPromises(
//       requestedIDS,
//       marketPricesData,
//       marketHistoryData,
//       adjustedPriceData,
//       fromDatabase
//     ) {
//       const missingData = [];
//       const returnData = [];

//       requestedIDLoop: for (let i in requestedIDS) {
//         let marketPrices = null;
//         let marketHistory = null;
//         let adjustedPrice = null;

//         if (fromDatabase) {
//           marketPrices = marketPricesData[i]?.val() || null;
//           marketHistory = marketHistoryData[i]?.val() || null;
//           adjustedPrice = adjustedPriceData[i]?.val() || null;
//         } else {
//           marketPrices = marketPricesData[i] || null;
//           marketHistory = marketHistoryData[i] || null;
//           adjustedPrice = adjustedPriceData[i]?.val() || null;
//         }

//         if (!marketPrices || !marketHistory) {
//           missingData.push(requestedIDS[i]);
//           continue;
//         }

//         let outputObject = { ...marketPrices };
//         outputObject.adjustedPrice = adjustedPrice?.adjusted_price || 0;
//         for (let location of DEFAULT_MARKET_LOCATIONS) {
//           if (fromDatabase && !marketHistory[location.name]) {
//             missingData.push(requestedIDS[i]);
//             continue requestedIDLoop;
//           }

//           const {
//             dailyAverageMarketPrice,
//             highestMarketPrice,
//             lowestMarketPrice,
//             dailyAverageOrderQuantity,
//             dailyAverageUnitCount,
//           } = marketHistory[location.name];

//           outputObject[location.name] = {
//             ...outputObject[location.name],
//             dailyAverageMarketPrice,
//             highestMarketPrice,
//             lowestMarketPrice,
//             dailyAverageOrderQuantity,
//             dailyAverageUnitCount,
//           };
//         }

//         returnData.push(outputObject);
//       }

//       return { returnData, missingData };
//     }

//     return res.status(200).json(returnData);
//   } catch (err) {
//     functions.logger.error(err);
//     return res
//       .status(500)
//       .send("Error retrieving market data, please try again.");
//   }
// });

// app.get("/systemindexes/:systemID", async (req, res) => {
//   const systemID = req.params.systemID;
//   if (isNaN(systemID)) {
//     return res.status(400).send("Invalid System ID");
//   }
//   try {
//     const idResponse = await admin
//       .database()
//       .ref(`live-data/system-indexes/${systemID}`)
//       .once("value");

//     const idData = idResponse.val();
//     if (!idData) {
//       functions.logger.log(`No System Data Found - ${systemID}`);
//       res.status(200).send(BuildMissingSystemIndexValue(systemID));
//     }

//     res.status(200).send(idData);
//   } catch (err) {
//     functions.logger.log(err.message);
//     res.status(500).send("Error retrieving system data, please try again.");
//   }
// });

// app.post("/systemindexes", async (req, res) => {
//   try {
//     const { idArray } = req.body;
//     if (!idArray || !Array.isArray(idArray) || idArray.length === 0) {
//       return res.status(400).send("Invalid or empty ID array");
//     }

//     const results = {};

//     const databaseRequests = idArray.map((id) =>
//       admin.database().ref(`live-data/system-indexes/${id}`).once("value")
//     );

//     const databaseResponses = await Promise.all(databaseRequests);

//     for (let itemReturn of databaseResponses) {
//       const itemData = itemReturn.val();
//       if (itemData !== null) {
//         results[itemData.solar_system_id] = itemData;
//       }
//     }

//     idArray.forEach((i) => {
//       if (!results[i]) {
//         results[i] = BuildMissingSystemIndexValue(i);
//       }
//     });

//     const returnData = Object.values(results);

//     functions.logger.log(
//       `${returnData.length} System Indexes Returned For ${req.header(
//         "accountID"
//       )}, [${idArray}]`
//     );

//     res
//       .status(200)
//       .setHeader("Content-Type", "application/json")
//       .send(returnData);
//   } catch (err) {
//     functions.logger.error(err.message);
//     return res
//       .status(500)
//       .send("Error retrieving system data, please try again.");
//   }
// });

// //Export the api to Firebase Cloud Functions
// exports.api = functions
//   .region("europe-west1")
//   .runWith({ maxInstances: 40 })
//   .https.onRequest(app);
// exports.createUserData = require("./Triggered Functions/Users");
// exports.RefreshItemPrices = require("./Scheduled Functions/refreshItemPrices");
// exports.RefreshItemHistory = require("./Scheduled Functions/marketHistoryRefresh");
// exports.RefreshSystemIndexes = require("./Scheduled Functions/refreshSystemIndexes");
// exports.RefreshAdjustedPrices = require("./Scheduled Functions/refreshAdjustedPrices");
// exports.archivedJobProcess = require("./Scheduled Functions/archievedJobs");
// exports.submitUserFeedback = require("./Triggered Functions/storeFeedback");
// exports.userClaims = require("./Triggered Functions/addCorpClaim");
// exports.checkAppVersion = require("./Triggered Functions/checkAppVersion");
// exports.checkSDEUpdates = require("./Scheduled Functions/checkSDEUpdates");
// // exports.findIngrediants = require("./Triggered Functions/findIngrediants");

import v1 from "./api/api-v1.js";

export { v1 };
