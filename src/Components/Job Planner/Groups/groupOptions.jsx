import { useContext, useState } from "react";
import {
  Button,
  ButtonGroup,
  CircularProgress,
  Grid,
  Paper,
  Tooltip,
} from "@mui/material";
import {
  DialogDataContext,
  MultiSelectJobPlannerContext,
  PriceEntryListContext,
} from "../../../Context/LayoutContext";
import { useJobManagement } from "../../../Hooks/useJobManagement";
import { ActiveJobContext, JobArrayContext } from "../../../Context/JobContext";
import { UserJobSnapshotContext } from "../../../Context/AuthContext";
import { useGroupManagement } from "../../../Hooks/useGroupManagement";
import { useMoveItemsOnPlanner } from "../../../Hooks/GeneralHooks/useMoveItemsOnPlanner";
import { useDeleteMultipleJobs } from "../../../Hooks/JobHooks/useDeleteMultipleJobs";
import { GroupOptionsDropDown } from "./groupOptionsDropdown";

export function GroupOptionsBar({
  groupJobs,
  updateShoppingListTrigger,
  updateShoppingListData,
  updateShowProcessing,
}) {
  const { multiSelectJobPlanner, updateMultiSelectJobPlanner } = useContext(
    MultiSelectJobPlannerContext
  );
  const { updatePriceEntryListData } = useContext(PriceEntryListContext);
  const { jobArray } = useContext(JobArrayContext);
  const { userJobSnapshot } = useContext(UserJobSnapshotContext);
  const { activeGroup } = useContext(ActiveJobContext);
  const { updateDialogData } = useContext(DialogDataContext);
  const { buildItemPriceEntry } = useJobManagement();
  const { buildFullJobTree, buildNextJobs } = useGroupManagement();
  const { moveItemsOnPlanner } = useMoveItemsOnPlanner();
  const { deleteMultipleJobs } = useDeleteMultipleJobs();

  return (
    <Paper
      elevation={3}
      square
      sx={{
        marginRight: { md: "10px" },
        marginLeft: { md: "10px" },
        padding: "20px",
      }}
    >
      <Grid container>
        <Grid container item xs={11}>
          <Grid item xs="auto">
            <Tooltip
              title="Displays a shopping list of the remaining materials needed to build all of the jobs within the group or just the selected jobs."
              arrow
              placement="bottom"
            >
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={async () => {
                  updateShowProcessing((prev) => !prev);
                  if (multiSelectJobPlanner.length > 0) {
                    updateShoppingListData(multiSelectJobPlanner);
                  } else {
                    updateShoppingListData([...activeGroup.includedJobIDs]);
                  }
                  updateShowProcessing((prev) => !prev);
                  updateShoppingListTrigger((prev) => !prev);
                }}
                sx={{
                  marginRight: "2px",
                  marginLeft: "2px",
                }}
              >
                Shopping List
              </Button>
            </Tooltip>
          </Grid>
          <Grid item xs="auto">
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={async () => {
                let itemList = null;
                updateShowProcessing((prev) => !prev);
                if (multiSelectJobPlanner.length > 0) {
                  itemList = await buildItemPriceEntry(multiSelectJobPlanner);
                } else {
                  itemList = await buildItemPriceEntry([
                    ...activeGroup.includedJobIDs,
                  ]);
                }
                updateShowProcessing((prev) => !prev);
                updatePriceEntryListData((prev) => ({
                  ...prev,
                  open: true,
                  list: itemList,
                }));
              }}
              sx={{
                marginRight: "2px",
                marginLeft: "2px",
              }}
            >
              Add Item Prices
            </Button>
          </Grid>
          <Grid item xs="auto">
            <Tooltip title="Moves the selected jobs 1 step backwards." arrow>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={async () => {
                  updateShowProcessing((prev) => !prev);
                  await moveItemsOnPlanner(multiSelectJobPlanner, "backward");
                  updateShowProcessing((prev) => !prev);
                }}
                sx={{
                  marginRight: "2px",
                  marginLeft: "2px",
                }}
              >
                Move Backward
              </Button>
            </Tooltip>
          </Grid>
          <Grid item xs="auto">
            <Tooltip title="Moves the selected jobs 1 step forwards." arrow>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={async () => {
                  updateShowProcessing((prev) => !prev);
                  moveItemsOnPlanner(multiSelectJobPlanner, "forward");
                  updateShowProcessing((prev) => !prev);
                }}
                sx={{
                  marginRight: "2px",
                  marginLeft: "2px",
                }}
              >
                Move Forward
              </Button>
            </Tooltip>
          </Grid>
          <Grid item xs="auto">
            <Tooltip
              title="Adds the next ingrediants of all of the jobs or just the selected jobs."
              arrow
              placement="bottom"
            >
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={async () => {
                  updateShowProcessing((prev) => !prev);
                  if (multiSelectJobPlanner.length > 0) {
                    await buildNextJobs(multiSelectJobPlanner);
                  } else {
                    await buildNextJobs([...activeGroup.includedJobIDs]);
                  }
                  updateShowProcessing((prev) => !prev);
                }}
                sx={{
                  marginRight: "2px",
                  marginLeft: "2px",
                }}
              >
                Build Child Jobs
              </Button>
            </Tooltip>
          </Grid>
          <Grid item xs="auto">
            <Tooltip
              title="Adds the full item tree for all output jobs."
              arrow
              placement="bottom"
            >
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={async () => {
                  updateShowProcessing((prev) => !prev);
                  await buildFullJobTree([...activeGroup.includedJobIDs]);
                  updateShowProcessing((prev) => !prev);
                }}
                sx={{
                  marginRight: "2px",
                  marginLeft: "2px",
                }}
              >
                Build Full Tree
              </Button>
            </Tooltip>
          </Grid>
          <Grid item xs="auto">
            <Tooltip
              title="Selects all jobs in the group"
              arrow
              placement="bottom"
            >
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={() => {
                  let groupIDSet = new Set();
                  for (let job of groupJobs) {
                    groupIDSet.add(job.jobID);
                  }
                  updateMultiSelectJobPlanner([...groupIDSet]);
                }}
              >
                Select All
              </Button>
            </Tooltip>
          </Grid>
          <Grid item xs="auto">
            <Button
              fullWidth
              variant="outlined"
              size="small"
              disabled={!multiSelectJobPlanner.length > 0}
              onClick={() => {
                updateMultiSelectJobPlanner([]);
              }}
            >
              Clear Selection
            </Button>
          </Grid>
          <Grid item xs="auto">
            <Tooltip title="Deletes Selected Jobs" arrow placement="bottom">
              <Button
                fullWidth
                variant="outlined"
                size="small"
                color="error"
                onClick={() => {
                  deleteMultipleJobs(multiSelectJobPlanner);
                  updateMultiSelectJobPlanner([]);
                }}
              >
                Delete
              </Button>
            </Tooltip>
          </Grid>
        </Grid>
        <Grid item xs={1} align="right">
          <GroupOptionsDropDown groupJobs={groupJobs} />
        </Grid>
      </Grid>
    </Paper>
  );
}
