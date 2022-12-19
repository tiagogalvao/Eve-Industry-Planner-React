import { Grid, Paper, Typography } from "@mui/material";
import { useEffect } from "react";
import { useState } from "react";
import { useContext } from "react";
import { UserJobSnapshotContext } from "../../../Context/AuthContext";
import { ActiveJobContext, JobArrayContext } from "../../../Context/JobContext";
import { useGroupManagement } from "../../../Hooks/useGroupManagement";
import { useJobManagement } from "../../../Hooks/useJobManagement";

export function OutputJobsPanel({ groupJobs }) {
  const { activeGroup } = useContext(ActiveJobContext);
  const { userJobSnapshot } = useContext(UserJobSnapshotContext);
  const { jobArray } = useContext(JobArrayContext);
  const [outputJobs, updateOutputJobs] = useState([]);
  const { findJobData } = useJobManagement();
  const { calculateCurrentJobBuildCostFromChildren } = useGroupManagement();

  useEffect(() => {
    async function findOutputJobs() {
      let returnArray = [];
      for (let jobID of activeGroup.includedJobIDs) {
        let [job] = await findJobData(jobID, userJobSnapshot, jobArray);
        if (job.parentJob.length === 0) {
          returnArray.push(job);
        }
      }
      updateOutputJobs(returnArray);
    }
    findOutputJobs();
  }, [activeGroup.includedJobIDs]);

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
        {outputJobs.map((job) => {
          let buildCost = calculateCurrentJobBuildCostFromChildren(job);
          console.log(buildCost);
          return (
            <Grid key={job.jobID} container item xs={6} sm={4}>
              <Grid item xs={12}>
                <picture>
                  <source
                    media="(max-width:700px)"
                    srcSet={`https://images.evetech.net/types/${job.itemID}/icon?size=32`}
                    alt=""
                  />
                  <img
                    src={`https://images.evetech.net/types/${job.itemID}/icon?size=64`}
                    alt=""
                  />
                </picture>
              </Grid>
              <Grid item xs={12}>
                <Typography>{job.name}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>{job.build.products.totalQuantity}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>{buildCost.toLocaleString()}</Typography>
                </Grid>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
}
