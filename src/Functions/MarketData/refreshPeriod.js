import GLOBAL_CONFIG from "../../global-config-app";

const { DEFAULT_ITEM_REFRESH_PERIOD } = GLOBAL_CONFIG;

function doesMarketItemRequireRefresh(marketObject) {
  const chosenRefreshPoint = Date.now() - DEFAULT_ITEM_REFRESH_PERIOD;
  if (marketObject.lastUpdated <= chosenRefreshPoint) {
    return true;
  }
  return false;
}

export default doesMarketItemRequireRefresh;
