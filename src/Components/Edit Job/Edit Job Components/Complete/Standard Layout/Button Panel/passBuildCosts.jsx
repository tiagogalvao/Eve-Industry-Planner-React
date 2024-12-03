import { useContext } from "react";
import { Button, Tooltip } from "@mui/material";
import {
  ActiveJobContext,
  JobArrayContext,
} from "../../../../../../Context/JobContext";
import {
  FirebaseListenersContext,
  IsLoggedInContext,
  UserJobSnapshotContext,
} from "../../../../../../Context/AuthContext";
import { getAnalytics, logEvent } from "firebase/analytics";
import { useHelperFunction } from "../../../../../../Hooks/GeneralHooks/useHelperFunctions";
import uploadJobSnapshotsToFirebase from "../../../../../../Functions/Firebase/uploadJobSnapshots";
import manageListenerRequests from "../../../../../../Functions/Firebase/manageListenerRequests";
import getCurrentFirebaseUser from "../../../../../../Functions/Firebase/currentFirebaseUser";
import passBuildCostsToParentJobs from "../../../../../../Functions/Shared/passBuildCosts";

export function PassBuildCostsButton({ activeJob }) {
  const { jobArray, updateJobArray, groupArray, updateGroupArray } =
    useContext(JobArrayContext);
  const { activeGroup } = useContext(ActiveJobContext);
  const { isLoggedIn } = useContext(IsLoggedInContext);
  const { userJobSnapshot, updateUserJobSnapshot } = useContext(
    UserJobSnapshotContext
  );
  const { firebaseListeners, updateFirebaseListeners } = useContext(
    FirebaseListenersContext
  );
  const { sendSnackbarNotificationSuccess, sendSnackbarNotificationError } =
    useHelperFunction();
  const analytics = getAnalytics();

  const buttonText = activeGroup
    ? "Send Build Costs & Complete"
    : "Send Build Costs";

  async function passCost() {
    const retrievedJobs = [];
    const messageText = await passBuildCostsToParentJobs(
      activeJob,
      jobArray,
      userJobSnapshot,
      retrievedJobs
    );

    if (activeGroup) {
      const currentGroup = groupArray.find((i) => i.groupID === activeGroup);
      currentGroup.addAreComplete(activeJob.jobID);
    }

    if (messageText) {
      sendSnackbarNotificationSuccess(messageText);
    } else {
      sendSnackbarNotificationError(`No build costs imported.`, 3);
    }
    manageListenerRequests(
      retrievedJobs,
      updateJobArray,
      updateFirebaseListeners,
      firebaseListeners,
      isLoggedIn
    );

    logEvent(analytics, "Import Costs", {
      UID: getCurrentFirebaseUser(),
      isLoggedIn: isLoggedIn,
    });

    updateUserJobSnapshot((prev) => [...prev]);
    updateJobArray((prev) => {
      const existingIDs = new Set(prev.map(({ jobID }) => jobID));
      return [
        ...prev,
        ...retrievedJobs.filter(({ jobID }) => !existingIDs.has(jobID)),
      ];
    });

    if (isLoggedIn) {
      await uploadJobSnapshotsToFirebase(userJobSnapshot);
    }
  }

  if (activeJob.parentJob.length === 0) {
    return null;
  }

  return (
    <Tooltip arrow title="Sends the item build cost to all parent jobs.">
      <Button
        color="primary"
        variant="contained"
        size="small"
        onClick={passCost}
        sx={{ margin: "10px" }}
      >
        {buttonText}
      </Button>
    </Tooltip>
  );
}
