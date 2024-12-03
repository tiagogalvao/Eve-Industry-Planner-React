import { Button } from "@mui/material";
import { useContext } from "react";
import {
  ActiveJobContext,
  JobArrayContext,
} from "../../../../../../Context/JobContext";

export function MarkAsCompleteButton({ activeJob, setJobModified }) {
  const { groupArray, updateGroupArray } = useContext(JobArrayContext);
  const { activeGroup } = useContext(ActiveJobContext);

  const activeGroupObject = groupArray.find((i) => i.groupID === activeGroup);

  function toggleMarkJobAsComplete() {
    const selectedMethod = activeGroupObject.areComplete.has(activeJob.jobID)
      ? activeGroupObject.removeAreComplete
      : activeGroupObject.addAreComplete;

    selectedMethod(activeJob.jobID);

    updateGroupArray((prev) => [...prev]);
    setJobModified(true);
  }

  if (!activeGroup) {
    return null;
  }

  return (
    <Button
      color="primary"
      variant="contained"
      size="small"
      onClick={toggleMarkJobAsComplete}
      sx={{ margin: "10px" }}
    >
      {activeGroupObject.areComplete.has(activeJob.jobID)
        ? "Mark As Incomplete"
        : "Mark As Complete"}
    </Button>
  );
}
