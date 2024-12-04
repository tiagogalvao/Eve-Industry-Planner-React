function convertMarketDataResponseToObject(responseArray) {
  const responseObject = {};

  for (let data of responseArray) {
    if (data.status !== "fulfilled") continue;

    if (Array.isArray(data.value)) {
      data.value.forEach(
        (priceObject) => (responseObject[priceObject.typeID] = priceObject)
      );
    }
  }
  return responseObject;
}

export default convertMarketDataResponseToObject;
