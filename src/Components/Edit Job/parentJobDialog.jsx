import { useContext, useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { JobArrayContext } from "../../Context/JobContext";
import { UserJobSnapshotContext } from "../../Context/AuthContext";
import { useHelperFunction } from "../../Hooks/GeneralHooks/useHelperFunctions";

export function ParentJobDialog({
  activeJob,
  dialogTrigger,
  updateDialogTrigger,
  setJobModified,
  parentChildToEdit,
  updateParentChildToEdit,
}) {
  const { jobArray } = useContext(JobArrayContext);
  const { userJobSnapshot } = useContext(UserJobSnapshotContext);
  const [matches, updateMatches] = useState([]);
  const { sendSnackbarNotificationSuccess } = useHelperFunction();

  const handleClose = () => {
    updateDialogTrigger(false);
  };

  useEffect(() => {
    if (!dialogTrigger) {
      return;
    }
    let newMatches = [];
    if (!activeJob.groupID) {
      newMatches = userJobSnapshot.filter(
        (job) =>
          (job.materialIDs.has(activeJob.itemID) &&
            !activeJob.parentJob.includes(job.jobID) &&
            !parentChildToEdit.parentJobs.add.includes(job.jobID)) ||
          parentChildToEdit.parentJobs.remove.includes(job.jobID)
      );
    } else {
      newMatches = jobArray.filter(
        (job) =>
          (job.groupID === activeJob.groupID &&
            !activeJob.parentJob.includes(job.jobID) &&
            job.build.materials.some(
              (material) => material.typeID === activeJob.itemID
            ) &&
            !parentChildToEdit.parentJobs.add.includes(job.jobID)) ||
          parentChildToEdit.parentJobs.remove.includes(job.jobID)
      );
    }
    updateMatches(newMatches);
  }, [dialogTrigger]);

  return (
    <Dialog
      open={dialogTrigger}
      onClose={handleClose}
      sx={{ padding: "20px", width: "100%" }}
    >
      <DialogTitle
        id="ParentJobDialog"
        align="center"
        sx={{ marginBottom: "10px" }}
        color="primary"
      >
        Link Parent Job
      </DialogTitle>
      <DialogContent>
        <Grid container>
          {matches.length > 0 ? (
            matches.map((job) => {
              return (
                <Grid
                  container
                  key={job.jobID}
                  item
                  xs={12}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Grid
                    item
                    sm={1}
                    sx={{
                      display: { xs: "none", sm: "block" },
                    }}
                    align="center"
                  >
                    <img
                      src={`https://images.evetech.net/types/${job.itemID}/icon?size=32`}
                      alt=""
                    />
                  </Grid>
                  <Grid item xs={6} align="center" sx={{ paddingLeft: "10px" }}>
                    <Typography variant="body1">{job.name}</Typography>
                  </Grid>
                  <Grid item xs={4} align="center">
                    <Typography variant="body2">
                      Runs {job.runCount} Jobs {job.jobCount}
                    </Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => {
                        updateParentChildToEdit((prev) => ({
                          ...prev,
                          parentJobs: {
                            ...prev.parentJobs,
                            add: [
                              ...new Set([
                                ...(prev.parentJobs.add || []),
                                job.jobID,
                              ]),
                            ],
                            remove: (prev.parentJobs.remove || []).filter(
                              (id) => id !== job.jobID
                            ),
                          },
                        }));
                        setJobModified(true);
                        sendSnackbarNotificationSuccess(`${job.name} Linked`);
                        handleClose();
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              );
            })
          ) : (
            <Grid item xs={12}>
              No Jobs Available
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
