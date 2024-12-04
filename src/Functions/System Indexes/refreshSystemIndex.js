import getSystemIndexDataFromFirebase from "../Firebase/getSystemIndex";
import doesSystemIndexRequireRefresh from "./refreshPeriod";

async function refreshSystemIndexes(systemIndexObject) {
  const systemIndexValues = Object.values(systemIndexObject);
  const outdatedItems = [];

  for (let indexObject of systemIndexValues) {
    if (doesSystemIndexRequireRefresh(indexObject)) {
      outdatedItems.push(indexObject.solar_system_id);
    }
  }

  if (outdatedItems.length === 0) return {};

  const refreshedIndexes = await getSystemIndexDataFromFirebase(outdatedItems);

  return refreshedIndexes;
}

export default refreshSystemIndexes;
