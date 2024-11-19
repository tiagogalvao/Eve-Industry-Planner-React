import convertMarketDataResponseToObject from "./convertResponse";
import doesMarketItemRequireRefresh from "./refreshPeriod";

async function refreshMarketData(evePricesObject) {
  const outdatedPriceIDSet = new Set();

  Object.values(evePricesObject).forEach((item) => {
    if (doesMarketItemRequireRefresh(item)) {
      outdatedPriceIDSet.add(item.typeID);
    }
  });

  const returnedPrices = await Promise.allSettled(
    splitMarketDataRequestIntoChuncks([...outdatedPriceIDSet])
  );

  return convertMarketDataResponseToObject(returnedPrices);
}

export default refreshMarketData;
