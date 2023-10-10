import { useContext, useMemo } from "react";
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
import ClearIcon from "@mui/icons-material/Clear";
import {
  IsLoggedInContext,
  UserJobSnapshotContext,
} from "../../../../../../Context/AuthContext";
import { JobArrayContext } from "../../../../../../Context/JobContext";
import { useFirebase } from "../../../../../../Hooks/useFirebase";
import { SnackBarDataContext } from "../../../../../../Context/LayoutContext";
import { useJobSnapshotManagement } from "../../../../../../Hooks/JobHooks/useJobSnapshots";
import { useFindJobObject } from "../../../../../../Hooks/GeneralHooks/useFindJobObject";

export function ChildJobDialogue({
  activeJob,
  updateActiveJob,
  material,
  childDialogTrigger,
  updateChildDialogTrigger,
  setJobModified,
  parentChildToEdit,
  updateParentChildToEdit,
}) {
  const { isLoggedIn } = useContext(IsLoggedInContext);
  const { jobArray, updateJobArray } = useContext(JobArrayContext);
  const { userJobSnapshot, updateUserJobSnapshot } = useContext(
    UserJobSnapshotContext
  );
  const { uploadJob, uploadUserJobSnapshot } = useFirebase();
  const { setSnackbarData } = useContext(SnackBarDataContext);
  const { updateJobSnapshot } = useJobSnapshotManagement();
  const { findJobData } = useFindJobObject();

  const materialChildJobs = activeJob.build.childJobs[material.typeID];

  const handleClose = () => {
    updateChildDialogTrigger(false);
  };

  const matches = useMemo(() => {
    const jobs = activeJob.groupID === null ? userJobSnapshot : jobArray;
    const filteredJobs = jobs.filter(
      (job) =>
        job.itemID === material.typeID &&
        !materialChildJobs.includes(job.jobID) &&
        (activeJob.groupID === null || job.groupID === activeJob.groupID)
    );
    return filteredJobs;
  }, [activeJob, userJobSnapshot, jobArray, material]);

  return (
    <Dialog
      open={childDialogTrigger}
      onClose={handleClose}
      sx={{ padding: "20px", width: "100%" }}
    >
      <DialogTitle id="ParentJobDialog" align="center" color="primary">
        Available Child Job
      </DialogTitle>
      <DialogContent>
        <Grid container sx={{ marginBottom: "40px" }}>
          {matches.length > 0 ? (
            matches.map((job) => {
              const setupCount = Object.values(job.build.setup).reduce(
                (prev, setup) => {
                  return prev + 1;
                },
                0
              );
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
                      src={`https://image.eveonline.com/Type/${job.itemID}_32.png`}
                      alt=""
                    />
                  </Grid>
                  <Grid item xs={6} sx={{ paddingLeft: "10px" }}>
                    <Typography variant="body1">{job.name}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2">
                      Setups: {setupCount}
                    </Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => {
                        const newChildJobArray = [
                          ...activeJob.build.childJobs[material.typeID],
                        ];
                        const newChildJobstoAdd = new Set(
                          parentChildToEdit.childJobs[material.typeID]?.add
                        );
                        const newChildJobsToRemove = new Set(
                          parentChildToEdit.childJobs[material.typeID]?.remove
                        );

                        newChildJobstoAdd.add(job.jobID);
                        newChildJobsToRemove.delete(job.jobID);

                        newChildJobArray.push(job.jobID);

                        updateParentChildToEdit((prev) => ({
                          ...prev,
                          childJobs: {
                            [material.typeID]: {
                              ...prev.childJobs[material.typeID],
                              add: [...newChildJobstoAdd],
                              remove: [...newChildJobsToRemove],
                            },
                          },
                        }));

                        updateActiveJob((prev) => ({
                          ...prev,
                          build: {
                            ...prev.build,
                            childJobs: {
                              ...prev.build.childJobs,
                              [material.typeID]: newChildJobArray,
                            },
                          },
                        }));
                        setJobModified(true);
                        setSnackbarData((prev) => ({
                          ...prev,
                          open: true,
                          message: `${job.name} Linked`,
                          severity: "success",
                          autoHideDuration: 1000,
                        }));
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
              <Typography variant="body1" align="center">
                None Available
              </Typography>
            </Grid>
          )}
        </Grid>
        <Grid item sx={{ marginBottom: "10px" }}>
          <Typography variant="h6" color="primary" align="center">
            Linked Child Jobs
          </Typography>
        </Grid>
        <Grid container item>
          {materialChildJobs.length > 0 ? (
            materialChildJobs.map((childJobID) => {
              const jobMatch = jobArray.find((i) => i.jobID == childJobID);
              if (!jobMatch) return null;
              console.log(jobMatch);
              const setupCount = Object.values(jobMatch.build.setup).reduce(
                (prev, setup) => {
                  return prev + 1;
                },
                0
              );

              return (
                <Grid
                  container
                  key={jobMatch.jobID}
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
                      src={`https://image.eveonline.com/Type/${jobMatch.itemID}_32.png`}
                      alt=""
                    />
                  </Grid>
                  <Grid item xs={6} sx={{ paddingLeft: "10px" }}>
                    <Typography variant="body1">{jobMatch.name}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2">
                      Setups: {setupCount}
                    </Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        const newChildJobArray = [
                          ...new Set(
                            [...materialChildJobs].filter(
                              (jobID) => jobID !== jobMatch.jobID
                            )
                          ),
                        ];

                        const newChildJobstoAdd = new Set(
                          parentChildToEdit.childJobs[material.typeID]?.add
                        );
                        const newChildJobsToRemove = new Set(
                          parentChildToEdit.childJobs[material.typeID]?.remove
                        );

                        newChildJobstoAdd.delete(jobMatch.jobID);
                        newChildJobsToRemove.add(jobMatch.jobID);

                        updateParentChildToEdit((prev) => ({
                          ...prev,
                          childJobs: {
                            [material.typeID]: {
                              ...prev.childJobs[material.typeID],
                              add: [...newChildJobstoAdd],
                              remove: [...newChildJobsToRemove],
                            },
                          },
                        }));

                        updateActiveJob((prev) => ({
                          ...prev,
                          build: {
                            ...prev.build,
                            childJobs: {
                              ...prev.build.childJobs,
                              [material.typeID]: newChildJobArray,
                            },
                          },
                        }));
                        setJobModified(true);
                        setSnackbarData((prev) => ({
                          ...prev,
                          open: true,
                          message: `${jobMatch.name} Unlinked`,
                          severity: "success",
                          autoHideDuration: 1000,
                        }));
                      }}
                    >
                      <ClearIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              );
            })
          ) : (
            <Grid item xs={12}>
              <Typography variant="body1" align="center">
                None Linked
              </Typography>
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
