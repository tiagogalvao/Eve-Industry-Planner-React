import GLOBAL_CONFIG from "../../global-config-app";

const { DEFAULT_ITEM_REFRESH_PERIOD } = GLOBAL_CONFIG;

function doesSystemIndexRequireRefresh(systemIndexObject) {
  const chosenRefreshPoint =
    Date.now() - DEFAULT_ITEM_REFRESH_PERIOD * 24 * 60 * 60 * 1000;
  if (systemIndexObject.lastUpdated <= chosenRefreshPoint) {
    return true;
  }
  return false;
}

export default doesSystemIndexRequireRefresh;
