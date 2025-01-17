import { useContext } from "react";
import { Grid, Paper, Typography, Checkbox } from "@mui/material";
import { IsLoggedInContext } from "../../../../Context/AuthContext";
import {
  ApplicationSettingsContext,
  UserLoginUIContext,
} from "../../../../Context/LayoutContext";
import uploadApplicationSettingsToFirebase from "../../../../Functions/Firebase/uploadApplicationSettings";

export function TutorialStep4({ activeJob }) {
  const { isLoggedIn } = useContext(IsLoggedInContext);
  const { applicationSettings, updateApplicationSettings } = useContext(
    ApplicationSettingsContext
  );
  const { userDataFetch } = useContext(UserLoginUIContext);

  if (!applicationSettings.hideTutorials && userDataFetch) {
    return (
      <Grid item xs={12}>
        <Paper
          elevation={3}
          sx={{
            padding: "20px",
          }}
          square={true}
        >
          <Grid container>
            <Grid item xs={12} align="left">
              <Typography
                color="primary"
                sx={{ typography: { xs: "body2", sm: "body1" } }}
              >
                <b>Help:</b>
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography sx={{ typography: { xs: "caption", sm: "body2" } }}>
                So, you have now finished building your {activeJob.name}. This
                stage where we complete the build cost calculations to work out
                the final cost before we move onto selling our item or passing
                this into another job.
                {<br />}
                You will see the total material cost as was calculated
                previously, the total installation costs for the industry jobs
                that you linked and any extra costs that may have been added.
                {<br />}
                {<br />}
                The extra costs allows you to add or subtract amounts from the
                build costs. Maybe you paid a friend to haul some items that you
                needed, or you are adding the installation costs for an older
                job that does not appear within the ESI data provided.
                {<br />}
                {<br />}
                For users who have logged in there is an Archive Job button,
                this will remove the job from your planner but not the database.
                This will then be used to generate a build cost history for each
                item allowing you to see how much you have previously built
                these items for when comparing these to current market costs.
              </Typography>
            </Grid>
            {isLoggedIn && (
              <Grid container item xs={12}>
                <Grid item xs={6} sm={9} />
                <Grid item xs={6} sm={3} align="right">
                  <Typography variant="caption">Hide Help Options</Typography>
                  <Checkbox
                    sx={{
                      color: (theme) =>
                        theme.palette.type === "dark"
                          ? theme.palette.primary.main
                          : theme.palette.secondary.main,
                    }}
                    size="small"
                    onClick={() => {
                      const newApplicationSettings =
                        applicationSettings.toggleHideTutorials();
                      updateApplicationSettings(newApplicationSettings);
                      uploadApplicationSettingsToFirebase(newApplicationSettings);
                    }}
                  />
                </Grid>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Grid>
    );
  } else return null;
}
