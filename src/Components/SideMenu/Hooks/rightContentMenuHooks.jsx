import { useHelperFunction } from "../../../Hooks/GeneralHooks/useHelperFunctions";

function useRightContentDrawer() {
  const { checkDisplayTutorials } = useHelperFunction();
  function toggleRightDrawerColapse(
    newContentID,
    existingContentID,
    updaterFunction,
    pageRequiresDrawerToBeOpen = false
  ) {
    const tutorialFlag = checkDisplayTutorials();
    if (pageRequiresDrawerToBeOpen) {
      updaterFunction(true);
      return;
    }

    if (newContentID === existingContentID && !tutorialFlag) {
      updaterFunction(false);
      return;
    } else {
      updaterFunction(true);
      return;
    }
  }

  return {
    toggleRightDrawerColapse,
  };
}

export default useRightContentDrawer;
