import {
  Autocomplete,
  Grid,
  FormControl,
  FormHelperText,
  MenuItem,
  Paper,
  TextField,
  Select,
} from "@mui/material";
import { useContext, useState } from "react";
import { ActiveJobContext } from "../../../../../Context/JobContext";
import {
  IsLoggedInContext,
  UsersContext,
} from "../../../../../Context/AuthContext";
import { blueprintVariables } from "../../..";
import { useBlueprintCalc } from "../../../../../Hooks/useBlueprintCalc";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  TextField: {
    "& .MuiFormHelperText-root": {
      color: theme.palette.secondary.main,
    },
    "& input::-webkit-clear-button, & input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
      {
        display: "none",
      },
  },
  Autocomplete: {
    "& .MuiFormHelperText-root": {
      color: theme.palette.secondary.main,
    },
  },
}));

export function ReactionOptions({ setJobModified }) {
  const { activeJob, updateActiveJob } = useContext(ActiveJobContext);
  const { users } = useContext(UsersContext);
  const { isLoggedIn } = useContext(IsLoggedInContext);
  const [buildCharName, updateBuildCharName] = useState(activeJob.build.buildChar)
  const [structValue, updateStructValue] = useState(
    activeJob.structureTypeDisplay
  );
  const [rigsValue, updateRigsValue] = useState(activeJob.rigType)
  const [systemValue, updateSystemValue] = useState(activeJob.systemType)
  const { CalculateResources } = useBlueprintCalc();
  const classes = useStyles();

  const parentUser = users.find((i) => i.ParentUser === true);
  return (
    <Paper
      elevation={3}
      sx={{
        minWidth: "100%",
        padding: "20px",
      }}
      square={true}
    >
      <Grid container direction="column">
        <Grid item container direction="row" spacing={2}>
        <Grid item xs={12} xl={8}>
          <FormControl className={classes.TextField} fullWidth={true}>
            <Select
              variant="standard"
              size="small"
              value={buildCharName}
              onChange={(e) => {
                setJobModified(true)
                updateBuildCharName(e.target.value)
                updateActiveJob((prev) => ({
                  ...prev,
                  build: {
                    ...prev.build,
                    buildChar: e.target.value
                  }
                }))  
              }}
            >
              {users.map((user) => {
                return (
                  <MenuItem key={user.CharacterName} value={user.CharacterHash}>
                  {user.CharacterName}
                </MenuItem>
                )
              })}
              </Select>
              <FormHelperText variant="standard">
                  Use Character
                </FormHelperText>
              </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              defaultValue={activeJob.runCount}
              className={classes.TextField}
              size="small"
              variant="standard"
              helperText="Blueprint Runs"
              type="number"
              onBlur={(e) => {
                const oldJob = JSON.parse(JSON.stringify(activeJob));
                oldJob.runCount = Number(e.target.value);
                const newJob = CalculateResources(oldJob);
                updateActiveJob(newJob);
                setJobModified(true);
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              defaultValue={activeJob.jobCount}
              className={classes.TextField}
              size="small"
              variant="standard"
              helperText="Job Slots"
              type="number"
              onBlur={(e) => {
                const oldJob = JSON.parse(JSON.stringify(activeJob));
                oldJob.jobCount = Number(e.target.value);
                const newJob = CalculateResources(oldJob);
                updateActiveJob(newJob);
                setJobModified(true);
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl className={classes.TextField} fullWidth={true}>
              <Select
              variant="standard"
              size="small"
              value={structValue}
              onChange={(e) => {
                  const oldJob = JSON.parse(JSON.stringify(activeJob));
                  oldJob.structureTypeDisplay = e.target.value;
                  oldJob.structureType = 1;
                  const newJob = CalculateResources(oldJob);
                  updateStructValue(e.target.value);
                  updateActiveJob(newJob);
              }}
            >
              {blueprintVariables.reactionStructure.map((entry) => {
                return (
                  <MenuItem key={entry.label} value={entry.value}>
                    {entry.label}
                  </MenuItem>
                );
              })}
            </Select>
              <FormHelperText variant="standard">Structure Type</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl className={classes.TextField} fullWidth={true}>
            <Select
                variant="standard"
                size="small"
                value={rigsValue}
                onChange={(e) => {
                  const oldJob = JSON.parse(JSON.stringify(activeJob));
                  oldJob.rigType = e.target.value;
                  const newJob = CalculateResources(oldJob);
                  updateActiveJob(newJob);
                  updateRigsValue(e.target.value);
                  setJobModified(true);
                }}
              >
                {blueprintVariables.reactionRigs.map((entry) => {
                  return (
                    <MenuItem key={entry.label} value={entry.value}>
                      {entry.label}
                    </MenuItem>
                  );
                })}
              </Select>
              <FormHelperText variant="standard">Rig Type</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl className={classes.TextField} fullWidth={true}>
            <Select
                variant="standard"
                size="small"
                value={systemValue}
                onChange={(e) => {
                  const oldJob = JSON.parse(JSON.stringify(activeJob));
                  oldJob.systemType = e.target.value;
                  const newJob = CalculateResources(oldJob);
                  updateActiveJob(newJob);
                  updateSystemValue(e.target.value);
                  setJobModified(true);
                }}
              >
                {blueprintVariables.reactionSystem.map((entry) => {
                  return (
                    <MenuItem key={entry.label} value={entry.value}>
                      {entry.label}
                    </MenuItem>
                  );
                })}
              </Select>
              <FormHelperText variant="standard">System Type</FormHelperText>
            </FormControl>
          </Grid>
          {isLoggedIn && (
            <Grid item xs={12}>
              <FormControl className={classes.TextField} fullWidth={true}>
                <Select
                  variant="standard"
                  size="small"
                  renderValue={(selected) =>
                    selected.map((item) => item.name).join(", ")
                  }
                  value=""
                  onChange={(e, v) => {
                    const structure =
                      parentUser.settings.structures.manufacturing.find(
                        (i) => i.id === e.target.value
                      );
                    const oldJob = JSON.parse(JSON.stringify(activeJob));
                    oldJob.rigType = structure.rigType;
                    oldJob.systemType = structure.systemType;
                    oldJob.structureType = structure.structureValue;
                    oldJob.structureTypeDisplay = structure.structureName;
                    const newJob = CalculateResources(oldJob);
                    updateActiveJob(newJob);
                    setJobModified(true);
                  }}
                >
                  {parentUser.settings.structures.reaction.map((entry) => {
                    return (
                      <MenuItem key={entry.id} value={entry.id}>
                        {entry.name}
                      </MenuItem>
                    );
                  })}
                </Select>
                <FormHelperText variant="standard">
                  Apply Saved Structure
                </FormHelperText>
              </FormControl>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}
