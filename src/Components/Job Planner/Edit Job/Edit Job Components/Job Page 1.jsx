import React, { useContext } from "react";
import { ActiveJobContext } from "../../../../Context/JobContext";
import { UsersContext } from "../../../../Context/AuthContext";
import { Container, Grid } from "@mui/material";
import { ManufacturingOptions } from "./Page 1 Components/maunfacturingOptions";
import { ReactionOptions } from "./Page 1 Components/reactionOptions";
import { RawResourceList } from "./Page 1 Components/rawResources";
import { ProductionStats } from "./Page 1 Components/productionStats";
import { TutorialStep1 } from "./Page 1 Components/tutorialStep1";

export function EditPage1({ setJobModified }) {
  const { activeJob } = useContext(ActiveJobContext);
  const { users } = useContext(UsersContext);

  const parentUser = users.find((i) => i.ParentUser === true);

  function OptionSwitch() {
    switch (activeJob.jobType) {
      case 1:
        return <ManufacturingOptions setJobModified={setJobModified} />;
      case 2:
        return <ReactionOptions setJobModified={setJobModified} />;
      case 3:
        return null;
      default:
        return null;
    }
  }

  return (
    <Container
      disableGutters
      maxWidth="false"
      sx={{ width: "100%", marginTop: "20px" }}
    >
      <Grid container spacing={2}>
        {!parentUser.settings.layout.hideTutorials && (
          <Grid item xs={12}>
            <TutorialStep1 />
          </Grid>
        )}
        <Grid container direction="row" item xs={12} md={3} spacing={2}>
          <Grid item xs={12}>
            <ProductionStats />
          </Grid>
          <Grid item xs={12}>
            <OptionSwitch />
          </Grid>
        </Grid>
        <Grid item xs={12} md={9}>
          <RawResourceList />
        </Grid>
      </Grid>
    </Container>
  );
}