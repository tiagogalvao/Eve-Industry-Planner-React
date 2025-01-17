import { Grid, Typography } from "@mui/material";
import { STANDARD_TEXT_FORMAT } from "../../../../../Context/defaultValues";

export function ReactionESICardComplete({ job }) {
  return (
    <Grid container item xs={12} sx={{ paddingLeft: { xs: "0px", sm: "5px" } }}>
      <Grid container item xs={12}>
        <Grid item xs={4}>
          <Typography sx={{ typography: STANDARD_TEXT_FORMAT }}>
            Runs:
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <Typography sx={{ typography: STANDARD_TEXT_FORMAT }} align="right">
            {job.runs}
          </Typography>
        </Grid>
      </Grid>
      <Grid container item xs={12}>
        <Grid item xs={4}>
          <Typography sx={{ typography: STANDARD_TEXT_FORMAT }}>
            Status:
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <Typography sx={{ typography: STANDARD_TEXT_FORMAT }} align="right">
            Delivered
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
}
