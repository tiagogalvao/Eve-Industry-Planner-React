import { useContext } from "react";
import { JobArrayContext } from "../../Context/JobContext";
import {
  FirebaseListenersContext,
  IsLoggedInContext,
} from "../../Context/AuthContext";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../firebase";
import { useHelperFunction } from "./useHelperFunctions";
import { ApplicationSettingsContext } from "../../Context/LayoutContext";
import findOrGetJobObject from "../../Functions/Helper/findJobObject";
import getCurrentFirebaseUser from "../../Functions/Firebase/currentFirebaseUser";
import manageListenerRequests from "../../Functions/Firebase/manageListenerRequests";
import retrieveJobIDsFromGroupObjects from "../../Functions/Helper/getJobIDsFromGroupObjects";
import convertJobIDsToObjects from "../../Functions/Helper/convertJobIDsToObjects";
import seperateGroupAndJobIDs from "../../Functions/Helper/seperateGroupAndJobIDs";

export function useShoppingList() {
  const { jobArray, groupArray, updateJobArray } = useContext(JobArrayContext);
  const { isLoggedIn } = useContext(IsLoggedInContext);

  const { applicationSettings } = useContext(ApplicationSettingsContext);
  const { firebaseListeners, updateFirebaseListeners } = useContext(
    FirebaseListenersContext
  );
  const { findItemPriceObject, importAssetsFromClipboard_IconView } =
    useHelperFunction();

  async function buildShoppingList(inputJobIDs) {
    let finalShoppingList = [];
    const retrievedJobs = [];

    const { groupIDs, jobIDs } = seperateGroupAndJobIDs(inputJobIDs);

    const groupJobIDs = retrieveJobIDsFromGroupObjects(groupIDs, groupArray);

    const requestedJobObjects = await convertJobIDsToObjects(
      [...jobIDs, ...groupJobIDs],
      jobArray,
      retrievedJobs
    );

    for (let inputJob of requestedJobObjects) {
      inputJob.build.materials.forEach((material) => {
        if (material.quantityPurchased >= material.quantity) {
          return;
        }
        let childState =
          inputJob.build.childJobs[material.typeID].length > 0 ? true : false;
        let shoppingListEntries = finalShoppingList.filter(
          (i) => i.typeID === material.typeID
        );
        if (shoppingListEntries.length === 0) {
          finalShoppingList.push(buildShoppingListObject(material, childState));
          return;
        }
        let foundChild = shoppingListEntries.find(
          (i) => i.hasChild === childState
        );
        if (!foundChild) {
          finalShoppingList.push(buildShoppingListObject(material, childState));
        } else {
          foundChild.quantity += material.quantity - material.quantityPurchased;
        }
      });
    }
    finalShoppingList.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name < b.name) {
        return 1;
      }
      return 0;
    });
    logEvent(analytics, "Build Shopping List", {
      UID: getCurrentFirebaseUser(),
      buildCount: finalShoppingList.length,
      loggedIn: isLoggedIn,
    });
    manageListenerRequests(
      retrievedJobs,
      updateJobArray,
      updateFirebaseListeners,
      firebaseListeners,
      isLoggedIn
    );
    updateJobArray((prev) => {
      const existingIDs = new Set(prev.map(({ jobID }) => jobID));
      return [
        ...prev,
        ...retrievedJobs.filter(({ jobID }) => !existingIDs.has(jobID)),
      ];
    });
    return finalShoppingList;
  }

  function buildShoppingListObject(material, childJobPresent) {
    return {
      name: material.name,
      typeID: material.typeID,
      quantity: material.quantity - material.quantityPurchased,
      assetQuantity: 0,
      volume: material.volume,
      hasChild: childJobPresent,
      isVisible: false,
    };
  }

  function buildCopyText(item) {
    return `${item.name} ${Math.max(
      item.quantity - (item.assetQuantity || 0),
      0
    )}\n`;
  }

  function calculateItemPrice(item, alternativePriceLocation) {
    const itemPriceObject = findItemPriceObject(
      item.typeID,
      alternativePriceLocation
    );
    const individualItemPrice =
      itemPriceObject[applicationSettings.defaultMarket][
        applicationSettings.defaultOrders
      ];

    return (
      individualItemPrice * Math.max(item.quantity - item.assetQuantity, 0)
    );
  }

  function calculateVolumeTotal(item) {
    return item.volume * Math.max(item.quantity - item.assetQuantity, 0);
  }

  function isAssetQuantityVisable(item) {
    return Math.max(item.quantity - item.assetQuantity, 0) > 0 ? true : false;
  }

  function isChildJobVisable(childJobDisplayFlag, item) {
    return !childJobDisplayFlag && !item.hasChild ? true : false;
  }

  function isItemVisable(remvoveAssetFlag, childJobDisplayFlag, item) {
    const quantity = isAssetQuantityVisable(item);
    const childJob = isChildJobVisable(childJobDisplayFlag, item);

    if (remvoveAssetFlag && quantity && childJob) return true;

    if (!remvoveAssetFlag && childJob) return true;

    return false;
  }

  function generateTextToCopy(inputItems) {
    return inputItems.map((item) => buildCopyText(item)).join("");
  }

  function clearAssetQuantities(itemList) {
    itemList.forEach((item) => (item.assetQuantity = 0));
  }

  async function importAssetsFromClipboard(itemList) {
    const newItemList = [...itemList];
    const importedAssets = await importAssetsFromClipboard_IconView();
    for (let item of newItemList) {
      const matchedItem = importedAssets[item.name];
      if (!matchedItem) continue;
      item.assetQuantity = matchedItem;
      if (item.assetQuantity >= item.quantity) {
        item.isVisible = false;
      }
    }
    return newItemList;
  }

  return {
    buildShoppingList,
    calculateItemPrice,
    calculateVolumeTotal,
    clearAssetQuantities,
    generateTextToCopy,
    importAssetsFromClipboard,
    isItemVisable,
  };
}
