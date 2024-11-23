import { useContext } from "react";
import {
  FirebaseListenersContext,
  IsLoggedInContext,
  UserJobSnapshotContext,
} from "../../Context/AuthContext";
import {
  ActiveJobContext,
  JobArrayContext,
  LinkedIDsContext,
} from "../../Context/JobContext";
import { useHelperFunction } from "../GeneralHooks/useHelperFunctions";
import JobSnapshot from "../../Classes/jobSnapshotConstructor";
import addNewJobToFirebase from "../../Functions/Firebase/addNewJob";
import updateJobInFirebase from "../../Functions/Firebase/updateJob";
import uploadJobSnapshotsToFirebase from "../../Functions/Firebase/uploadJobSnapshots";
import manageListenerRequests from "../../Functions/Firebase/manageListenerRequests";
import applyParentChildChanges from "../../Components/Edit Job/functions/applyParentChildChanges";
import repairMissingParentChildRelationships from "../../Functions/Shared/repairParentChildRelationships";

export function useCloseActiveJob() {
  const { updateActiveJob } = useContext(ActiveJobContext);
  const { isLoggedIn } = useContext(IsLoggedInContext);
  const { jobArray, updateJobArray, groupArray, updateGroupArray } =
    useContext(JobArrayContext);
  const { userJobSnapshot, updateUserJobSnapshot } = useContext(
    UserJobSnapshotContext
  );
  const {
    linkedJobIDs,
    updateLinkedJobIDs,
    linkedOrderIDs,
    updateLinkedOrderIDs,
    linkedTransIDs,
    updateLinkedTransIDs,
  } = useContext(LinkedIDsContext);
  const { firebaseListeners, updateFirebaseListeners } = useContext(
    FirebaseListenersContext
  );
  const { sendSnackbarNotificationInfo } = useHelperFunction();

  async function closeActiveJob(
    inputJob,
    jobModifiedFlag,
    tempJobsToAdd,
    esiDataToLink,
    parentChildToEdit
  ) {
    if (!jobModifiedFlag) {
      updateActiveJob(null);
      return;
    }

    const retrievedJobs = Object.values(tempJobsToAdd);
    const IDsOfNewJobs = new Set(
      Object.values(tempJobsToAdd).map(({ jobID }) => jobID)
    );
    let newUserJobSnapshot = [...userJobSnapshot];
    const newLinkedJobIDs = new Set(linkedJobIDs);
    const newLinkedOrderIDs = new Set(linkedOrderIDs);
    const newLinkedTransIDs = new Set(linkedTransIDs);

    addIDsToSet(newLinkedJobIDs, esiDataToLink.industryJobs.add);
    addIDsToSet(newLinkedOrderIDs, esiDataToLink.marketOrders.add);
    addIDsToSet(newLinkedTransIDs, esiDataToLink.transactions.add);
    removeIDsFromSet(newLinkedJobIDs, esiDataToLink.industryJobs.remove);
    removeIDsFromSet(newLinkedOrderIDs, esiDataToLink.marketOrders.remove);
    removeIDsFromSet(newLinkedTransIDs, esiDataToLink.transactions.remove);

    const modifiedLinkedJobIDs = await applyParentChildChanges(
      parentChildToEdit,
      inputJob,
      jobArray,
      retrievedJobs
    );
    const repairedJobIDs = await repairMissingParentChildRelationships(
      inputJob,
      jobArray,
      retrievedJobs
    );

    const finalModifiedIDSet = new Set(
      [...modifiedLinkedJobIDs, ...repairedJobIDs].filter(
        (id) => !IDsOfNewJobs.has(id)
      )
    );

    for (let modifiedID of finalModifiedIDSet) {
      const matchedJob = jobArray.find((i) => i.jobID === modifiedID);
      if (!matchedJob) return;

      const matchedSnapshot = newUserJobSnapshot.find(
        (i) => i.jobID === matchedJob.jobID
      );

      if (matchedSnapshot) {
        matchedSnapshot.setSnapshot(matchedJob);
      }

      if (isLoggedIn) {
        await updateJobInFirebase(matchedJob);
      }
    }

    if (!inputJob.groupID) {
      for (let newJob of Object.values(tempJobsToAdd)) {
        newUserJobSnapshot.push(new JobSnapshot(newJob));
      }
    } else {
      const matchedGroup = groupArray.find(
        (i) => i.groupID === inputJob.groupID
      );
      if (matchedGroup) {
        matchedGroup.addJobsToGroup(Object.values(tempJobsToAdd));
      }
    }

    if (
      inputJob.groupID !== null &&
      inputJob.isReadyToSell &&
      !newUserJobSnapshot.some((i) => i.jobID === inputJob.jobID)
    ) {
      newUserJobSnapshot.push(new JobSnapshot(inputJob));
    } else {
      const matchedSnapshot = newUserJobSnapshot.find(
        (i) => i.jobID === inputJob.jobID
      );

      if (matchedSnapshot) {
        matchedSnapshot.setSnapshot(inputJob);
      }
    }

    manageListenerRequests(
      retrievedJobs,
      updateJobArray,
      updateFirebaseListeners,
      firebaseListeners,
      isLoggedIn
    );

    if (inputJob.groupID) {
      updateGroupArray((prev) => [...prev]);
    }

    updateLinkedJobIDs([...newLinkedJobIDs]);
    updateLinkedOrderIDs([...newLinkedOrderIDs]);
    updateLinkedTransIDs([...newLinkedTransIDs]);
    updateJobArray((prev) => {
      const existingIDs = new Set(prev.map(({ jobID }) => jobID));
      const updatedJobs = prev.map((job) =>
        job.jobID === inputJob.jobID ? inputJob : job
      );
      return [
        ...updatedJobs,
        ...retrievedJobs.filter(({ jobID }) => !existingIDs.has(jobID)),
      ];
    });
    updateUserJobSnapshot(newUserJobSnapshot);
    updateActiveJob(null);
    if (isLoggedIn) {
      await uploadJobSnapshotsToFirebase(newUserJobSnapshot);
      await updateJobInFirebase(inputJob);
      for (let newJob of Object.values(tempJobsToAdd)) {
        await addNewJobToFirebase(newJob);
      }
    }

    sendSnackbarNotificationInfo(`${inputJob.name} Updated`);
  }

  function addIDsToSet(originalSet, toBeAdded) {
    toBeAdded.forEach((i) => {
      originalSet.add(i);
    });
  }

  function removeIDsFromSet(originalSet, toBeRemoved) {
    toBeRemoved.forEach((i) => {
      originalSet.delete(i);
    });
  }

  return {
    closeActiveJob,
  };
}
