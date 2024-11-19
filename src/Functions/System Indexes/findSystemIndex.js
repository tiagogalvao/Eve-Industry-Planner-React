import getSystemIndexDataFromFirebase from "../Firebase/getSystemIndex";
import doesSystemIndexRequireRefresh from "./refreshPeriod";

async function getSystemIndexes(inputIDs, systemIndexObject) {
  if (!inputIDs) return {};

  if (Array.isArray(inputIDs)) {
    inputIDs = new Set(inputIDs);
  } else if (typeof inputIDs === "number") {
    inputIDs = new Set([inputIDs]);
  }

  const requiredIDArray = findRequiredSystemIndexes(
    inputIDs,
    systemIndexObject
  );

  if (requiredIDArray.length === 0) return {};

  const returnData = await getSystemIndexDataFromFirebase(requiredIDArray);

  return returnData;
}

function findRequiredSystemIndexes(inputSet, systemIndexObject) {
  let idsToRequest = new Set();
  if (!systemIndexObject) {
    for (const id of inputSet) {
      const matchedSystemIndex = systemIndexObject[id];
      if (!matchedSystemIndex) {
        idsToRequest.add(id);
      } else {
        if (doesSystemIndexRequireRefresh(matchedSystemIndex)) {
          idsToRequest.add(id);
        }
      }
    }
    return [...idsToRequest];
  } else {
    return [...inputSet];
  }
}

export default getSystemIndexes;
