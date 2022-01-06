import React, { useContext } from "react";
import {
  ActiveJobContext,
  ApiJobsContext,
} from "../../../../Context/JobContext";
import { Container, Grid } from "@mui/material";
import { LinkedJobs } from "./Page 3 Components/Linked Jobs";
import { AvailableJobs } from "./Page 3 Components/Available Jobs";

export function EditPage3({ setJobModified }) {
  const { activeJob } = useContext(ActiveJobContext);
  const { apiJobs } = useContext(ApiJobsContext);

  const jobMatches = apiJobs.filter(
    (job) =>
      activeJob.itemID === job.product_type_id &&
      !activeJob.apiJobs.includes(job.job_id) &&
      job.linked === false &&
      job.activity_id === 1
  );

  return (
    <Container disableGutters maxWidth="false">
      <Grid container direction="row" spacing={2}>
        <Grid item xs={12} md={6}>
          <AvailableJobs
            jobMatches={jobMatches}
            setJobModified={setJobModified}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <LinkedJobs setJobModified={setJobModified} />
        </Grid>
      </Grid>
    </Container>
  );
}
