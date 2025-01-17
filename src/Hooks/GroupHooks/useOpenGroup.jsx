import { useContext } from "react";
import { EvePricesContext } from "../../Context/EveDataContext";
import { ActiveJobContext, JobArrayContext } from "../../Context/JobContext";
import {
  DataExchangeContext,
  LoadingTextContext,
} from "../../Context/LayoutContext";
import manageListenerRequests from "../../Functions/Firebase/manageListenerRequests";
import {
  FirebaseListenersContext,
  IsLoggedInContext,
} from "../../Context/AuthContext";
import getMarketData from "../../Functions/MarketData/findMarketData";

export function useOpenGroup() {
  const { groupArray, updateJobArray } = useContext(JobArrayContext);
  const { updateActiveGroup } = useContext(ActiveJobContext);
  const { updateDataExchange } = useContext(DataExchangeContext);
  const { evePrices, updateEvePrices } = useContext(EvePricesContext);
  const { updateLoadingText } = useContext(LoadingTextContext);
  const { firebaseListeners, updateFirebaseListeners } = useContext(
    FirebaseListenersContext
  );
  const { isLoggedIn } = useContext(IsLoggedInContext);

  async function openGroup(inputGroupID) {
    let requestedGroup = groupArray.find((i) => i.groupID === inputGroupID);
    if (!requestedGroup) {
      return;
    }
    updateDataExchange((prev) => !prev);

    const itemPriceRequest = getMarketData(
      requestedGroup.materialIDs,
      evePrices
    );
    updateLoadingText((prevObj) => ({
      ...prevObj,
      jobData: true,
      priceData: true,
    }));
    updateLoadingText((prevObj) => ({
      ...prevObj,
      jobDataComp: true,
    }));
    manageListenerRequests(
      requestedGroup.includedJobIDs,
      updateJobArray,
      updateFirebaseListeners,
      firebaseListeners,
      isLoggedIn
    );
    const itemPriceResult = await itemPriceRequest;
    updateLoadingText((prevObj) => ({
      ...prevObj,
      jobData: true,
      jobDataComp: true,
      priceData: true,
      priceDataComp: true,
    }));
    updateEvePrices((prev) => ({
      ...prev,
      ...itemPriceResult,
    }));
    updateActiveGroup(inputGroupID);
    updateDataExchange((prev) => !prev);
    updateLoadingText((prevObj) => ({
      ...prevObj,
      jobData: false,
      jobDataComp: false,
      priceData: false,
      priceDataComp: false,
    }));
  }

  return {
    openGroup,
  };
}
