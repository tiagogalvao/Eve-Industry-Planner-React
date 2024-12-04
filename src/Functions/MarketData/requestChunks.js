import { trace } from "firebase/performance";
import { performance } from "../../firebase";
import getMarketDataFromFirebase from "../Firebase/getMarketData";

function splitMarketDataRequestIntoChuncks(requestArray) {
  const MAX_CHUNK_SIZE = 500;
  const promises = [];
  const firebaseTrace = trace(performance, "GetItemPrices");

  if (!requestArray || requestArray.length === 0) return promises;

  firebaseTrace.start();

  for (let x = 0; x < requestArray.length; x += MAX_CHUNK_SIZE) {
    const chunk = requestArray.slice(x, x + MAX_CHUNK_SIZE);
    promises.push(getMarketDataFromFirebase(chunk));
  }

  firebaseTrace.stop();
  return promises;
}

export default splitMarketDataRequestIntoChuncks;
