import { Button } from "@mui/material";
import { useManageGroupJobs } from "../../../../../../../Hooks/GroupHooks/useManageGroupJobs";

export function LinkExistingGroupJobButton_ChildJobPopoverFrame({
  activeJob,
  material,
  setJobModified,
  parentChildToEdit,
  updateParentChildToEdit,
}) {
  const { findMaterialJobIDInGroup } = useManageGroupJobs();

  function linkToGroupJob() {
    const matchedGroupJobID = findMaterialJobIDInGroup(
      material.typeID,
      activeJob.groupID
    );
    if (!matchedGroupJobID) return;

    updateParentChildToEdit((prev) => ({
      ...prev,
      childJobs: {
        ...prev.childJobs,
        [material.typeID]: {
          ...prev.childJobs[material.typeID],
          add: [
            ...new Set([
              ...(prev.childJobs[material.typeID]?.add || []),
              matchedGroupJobID,
            ]),
          ],
          remove: (prev.childJobs[material.typeID]?.remove || []).filter(
            (jobID) => jobID !== matchedGroupJobID
          ),
        },
      },
    }));

    setJobModified(true);
  }

  return (
    <Button size="small" onClick={linkToGroupJob}>
      Link To Existing Group Job
    </Button>
  );
}

export function UnlinkExistingChildJobButton_ChildJobPopoverFrame({
  activeJob,
  material,
  setJobModified,
  parentChildToEdit,
  updateParentChildToEdit,
}) {
  const { findMaterialJobIDInGroup } = useManageGroupJobs();

  function linkToGroupJob() {
    const matchedGroupJobID = findMaterialJobIDInGroup(
      material.typeID,
      activeJob.groupID
    );
    if (!matchedGroupJobID) return;

    updateParentChildToEdit((prev) => ({
      ...prev,
      childJobs: {
        ...prev.childJobs,
        [material.typeID]: {
          ...prev.childJobs[material.typeID],
          add: (prev.childJobs[material.typeID]?.add || []).filter(
            (jobID) => jobID !== matchedGroupJobID
          ),
          remove: [
            ...new Set([
              ...(prev.childJobs[material.typeID]?.remove || []),
              matchedGroupJobID,
            ]),
          ],
        },
      },
    }));
    setJobModified(true);
  }

  return (
    <Button size="small" onClick={linkToGroupJob}>
      Unlink from Existing Group Job
    </Button>
  );
}
