import convertMarketDataResponseToObject from "./convertResponse";
import doesMarketItemRequireRefresh from "./refreshPeriod";
import splitMarketDataRequestIntoChuncks from "./requestChunks";

async function getMarketData(inputIDs, evePricesObject) {
  if (!inputIDs) return {};

  if (Array.isArray(inputIDs)) {
    inputIDs = new Set(inputIDs);
  }

  const requiredIDArray = findRequiredPrices(inputIDs, evePricesObject);

  const returnedPrices = await Promise.allSettled(
    splitMarketDataRequestIntoChuncks(requiredIDArray)
  );

  return convertMarketDataResponseToObject(returnedPrices);
}

function findRequiredPrices(inputSet, evePricesObject) {
  let idsToRequest = new Set();
  if (evePricesObject) {
    for (const id of inputSet) {
      const currentPriceObject = evePricesObject[id];
      if (!currentPriceObject) {
        idsToRequest.add(id);
      } else {
        if (doesMarketItemRequireRefresh(currentPriceObject)) {
          idsToRequest.add(id);
        }
      }
    }
    return [...idsToRequest];
  } else {
    return [...inputSet];
  }
}

export default getMarketData;
