import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { structureOptions } from "../../../../Context/defaultValues";
import AddIcon from "@mui/icons-material/Add";
<<<<<<< HEAD
import { makeStyles } from "@mui/styles";
=======
>>>>>>> 30eec5e2076ea65502f8af77eb7e306834252569
import { useState } from "react";
import { useContext } from "react";
import { UsersContext } from "../../../../Context/AuthContext";
import { Masonry } from "@mui/lab";
import { useFirebase } from "../../../../Hooks/useFirebase";
import { getAnalytics, logEvent } from "firebase/analytics";
import { SnackBarDataContext } from "../../../../Context/LayoutContext";
import uuid from "react-uuid";
import systemIDS from "../../../../RawData/systems.json";
<<<<<<< HEAD
=======
<<<<<<<< HEAD:src/Components/Settings/SettingsModules/Compact/compactManufacturingStructures.jsx
>>>>>>> 30eec5e2076ea65502f8af77eb7e306834252569

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
    "& .MuiInputBase-input.MuiAutocomplete-input.MuiAutocomplete-inputRoot": {
      color:
        theme.palette.type === "dark" ? "black" : theme.palette.secondary.main,
      borderColor:
        theme.palette.type === "dark" ? "black" : theme.palette.secondary.main,
    },
  },
}));

<<<<<<< HEAD
export function ClassicManufacturingStrutures({ parentUserIndex }) {
  const { users, updateUsers } = useContext(UsersContext);
=======
export function CompactManufacturingStrutures({ parentUserIndex }) {
========
import { useMissingSystemIndex } from "../../../../Hooks/GeneralHooks/useImportMissingSystemIndexData";
import { SystemIndexContext } from "../../../../Context/EveDataContext";

export function ClassicManufacturingStrutures({ parentUserIndex }) {
>>>>>>>> 30eec5e2076ea65502f8af77eb7e306834252569:src/Components/Settings/SettingsModules/Classic/classicManufacturingStructures.jsx
  const { users, updateUsers } = useContext(UsersContext);
  const { updateSystemIndexData } = useContext(SystemIndexContext);
>>>>>>> 30eec5e2076ea65502f8af77eb7e306834252569
  const { updateMainUserDoc } = useFirebase();
  const { setSnackbarData } = useContext(SnackBarDataContext);

  const [textValue, updateTextValue] = useState(null);
  const [systemTypeValue, updateSystemTypeValue] = useState(
    structureOptions.manSystem[0].id
  );
  const [structValue, updateStructValue] = useState(
    structureOptions.manStructure[0].id
  );
  const [rigsValue, updateRigsValue] = useState(structureOptions.manRigs[0].id);
  const [taxValue, updateTaxValue] = useState(null);
  const [systemIDValue, updateSystemIDValue] = useState(null);
<<<<<<< HEAD
  const classes = useStyles();
  const analytics = getAnalytics();

  const handleSubmit = (event) => {
=======
<<<<<<<< HEAD:src/Components/Settings/SettingsModules/Compact/compactManufacturingStructures.jsx
  const classes = useStyles();
========
  const { findMissingSystemIndex } = useMissingSystemIndex();
>>>>>>>> 30eec5e2076ea65502f8af77eb7e306834252569:src/Components/Settings/SettingsModules/Classic/classicManufacturingStructures.jsx
  const analytics = getAnalytics();

  async function handleSubmit(event) {
>>>>>>> 30eec5e2076ea65502f8af77eb7e306834252569
    event.preventDefault();
    let newUsersArray = [...users];
    newUsersArray[parentUserIndex].settings.structures.manufacturing.push({
      id: `manStruct-${uuid()}`,
      name: textValue,
      systemType: systemTypeValue,
      structureType: structValue,
      rigType: rigsValue,
      systemID: systemIDValue,
<<<<<<< HEAD
      tax: taxValue,
=======
<<<<<<<< HEAD:src/Components/Settings/SettingsModules/Compact/compactManufacturingStructures.jsx
      tax: taxValue,
========
      tax:
        structValue === structureOptions.manStructure[0].id ? 0.25 : taxValue,
>>>>>>>> 30eec5e2076ea65502f8af77eb7e306834252569:src/Components/Settings/SettingsModules/Classic/classicManufacturingStructures.jsx
>>>>>>> 30eec5e2076ea65502f8af77eb7e306834252569
      default:
        newUsersArray[parentUserIndex].settings.structures.manufacturing
          .length === 0
          ? true
          : false,
    });

<<<<<<< HEAD
    updateMainUserDoc(newUsersArray);
=======
<<<<<<<< HEAD:src/Components/Settings/SettingsModules/Compact/compactManufacturingStructures.jsx
========
    const updatedSystemIndex = await findMissingSystemIndex(systemIDValue);

>>>>>>>> 30eec5e2076ea65502f8af77eb7e306834252569:src/Components/Settings/SettingsModules/Classic/classicManufacturingStructures.jsx
    updateMainUserDoc(newUsersArray);
    updateSystemIndexData(updatedSystemIndex);
>>>>>>> 30eec5e2076ea65502f8af77eb7e306834252569
    updateUsers(newUsersArray);
    logEvent(analytics, "Add Manufacturing Structure", {
      UID: newUsersArray[parentUserIndex].accountID,
    });
    setSnackbarData((prev) => ({
      ...prev,
      open: true,
      message: `${textValue} Added`,
      severity: "success",
      autoHideDuration: 1000,
    }));
<<<<<<< HEAD
  };
=======
  }
>>>>>>> 30eec5e2076ea65502f8af77eb7e306834252569

  return (
    <Paper elevation={3} sx={{ padding: "20px" }} square={true}>
      <Grid container>
        <Grid item xs={12} align="center" sx={{ marginBottom: "10px" }}>
          <Typography variant="h6" color="primary">
            Manufacturing Structures
          </Typography>
        </Grid>
        <Grid container item xs={12}>
          <Grid
            container
            item
            xs={12}
            lg={6}
            sx={{ paddingRight: { xs: "0px", lg: "5px" } }}
          >
            <Masonry columns={1} spacing={1}>
              <Box
                sx={{
                  padding: "20px",
                  marginBottom: { xs: "20px", lg: "0px" },
                }}
              >
                <form onSubmit={handleSubmit}>
                  <Grid container item xs={12}>
                    <Grid item xs={6} sx={{ paddingRight: "5px" }}>
                      <TextField
                        required={true}
                        size="small"
                        variant="standard"
<<<<<<< HEAD
                        className={classes.TextField}
=======
<<<<<<<< HEAD:src/Components/Settings/SettingsModules/Compact/compactManufacturingStructures.jsx
                        className={classes.TextField}
========
                        sx={{
                          "& .MuiFormHelperText-root": {
                            color: (theme) => theme.palette.secondary.main,
                          },
                          "& input::-webkit-clear-button, & input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                            {
                              display: "none",
                            },
                        }}
>>>>>>>> 30eec5e2076ea65502f8af77eb7e306834252569:src/Components/Settings/SettingsModules/Classic/classicManufacturingStructures.jsx
>>>>>>> 30eec5e2076ea65502f8af77eb7e306834252569
                        helperText="Display Name"
                        type="text"
                        onBlur={(e) => {
                          let input = e.target.value.replace(
                            /[^a-zA-Z0-9 ]/g,
                            ""
                          );
                          updateTextValue(input);
                        }}
                      />
                    </Grid>
                    <Grid item xs={6} sx={{ paddingLeft: "5px" }}>
                      <FormControl
<<<<<<< HEAD
                        className={classes.TextField}
=======
                        sx={{
                          "& .MuiFormHelperText-root": {
                            color: (theme) => theme.palette.secondary.main,
                          },
                          "& input::-webkit-clear-button, & input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                            {
                              display: "none",
                            },
                        }}
>>>>>>> 30eec5e2076ea65502f8af77eb7e306834252569
                        fullWidth={true}
                      >
                        <Select
                          variant="standard"
                          size="small"
                          value={systemTypeValue}
                          onChange={(e) => {
                            updateSystemTypeValue(e.target.value);
                          }}
                        >
                          {Object.values(structureOptions.manSystem).map(
                            (entry) => {
                              return (
                                <MenuItem key={entry.id} value={entry.id}>
                                  {entry.label}
                                </MenuItem>
                              );
                            }
                          )}
                        </Select>
                        <FormHelperText variant="standard">
                          System Type
                        </FormHelperText>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6} sx={{ paddingRight: "5px" }}>
                      <FormControl
<<<<<<< HEAD
                        className={classes.TextField}
=======
                        sx={{
                          "& .MuiFormHelperText-root": {
                            color: (theme) => theme.palette.secondary.main,
                          },
                          "& input::-webkit-clear-button, & input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                            {
                              display: "none",
                            },
                        }}
>>>>>>> 30eec5e2076ea65502f8af77eb7e306834252569
                        fullWidth={true}
                      >
                        <Select
                          variant="standard"
                          size="small"
                          value={structValue}
                          onChange={(e) => {
                            updateStructValue(e.target.value);
                          }}
                        >
                          {Object.values(structureOptions.manStructure).map(
                            (entry) => {
                              return (
                                <MenuItem key={entry.id} value={entry.id}>
                                  {entry.label}
                                </MenuItem>
                              );
                            }
                          )}
                        </Select>
                        <FormHelperText variant="standard">
                          Structure Type
                        </FormHelperText>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6} sx={{ paddingLeft: "5px" }}>
                      <FormControl
<<<<<<< HEAD
                        className={classes.TextField}
=======
                        sx={{
                          "& .MuiFormHelperText-root": {
                            color: (theme) => theme.palette.secondary.main,
                          },
                          "& input::-webkit-clear-button, & input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                            {
                              display: "none",
                            },
                        }}
>>>>>>> 30eec5e2076ea65502f8af77eb7e306834252569
                        fullWidth={true}
                      >
                        <Select
                          variant="standard"
                          size="small"
                          value={rigsValue}
                          onChange={(e) => {
                            updateRigsValue(e.target.value);
                          }}
                        >
                          {Object.values(structureOptions.manRigs).map(
                            (entry) => {
                              return (
                                <MenuItem key={entry.id} value={entry.id}>
                                  {entry.label}
                                </MenuItem>
                              );
                            }
                          )}
                        </Select>
                        <FormHelperText variant="standard">
                          Rig Type
                        </FormHelperText>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6} sx={{ paddingRight: "5px" }}>
                      <FormControl
<<<<<<< HEAD
                        className={classes.TextField}
=======
                        sx={{
                          "& .MuiFormHelperText-root": {
                            color: (theme) => theme.palette.secondary.main,
                          },
                          "& input::-webkit-clear-button, & input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                            {
                              display: "none",
                            },
                        }}
>>>>>>> 30eec5e2076ea65502f8af77eb7e306834252569
                        fullWidth={true}
                      >
                        <TextField
                          required={true}
                          size="small"
                          variant="standard"
<<<<<<< HEAD
                          className={classes.TextField}
=======
<<<<<<<< HEAD:src/Components/Settings/SettingsModules/Compact/compactManufacturingStructures.jsx
                          className={classes.TextField}
========
                          sx={{
                            "& .MuiFormHelperText-root": {
                              color: (theme) => theme.palette.secondary.main,
                            },
                            "& input::-webkit-clear-button, & input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                              {
                                display: "none",
                              },
                          }}
>>>>>>>> 30eec5e2076ea65502f8af77eb7e306834252569:src/Components/Settings/SettingsModules/Classic/classicManufacturingStructures.jsx
>>>>>>> 30eec5e2076ea65502f8af77eb7e306834252569
                          helperText="Installation Tax %"
                          inputProps={{
                            step: "0.01",
                          }}
                          type="number"
                          onBlur={(e) => {
                            updateTaxValue(Number(e.target.value));
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={6} sx={{ paddingLeft: "5px" }}>
                      <FormControl
<<<<<<< HEAD
                        className={classes.TextField}
=======
<<<<<<<< HEAD:src/Components/Settings/SettingsModules/Compact/compactManufacturingStructures.jsx
                        className={classes.TextField}
========
                        sx={{
                          "& .MuiFormHelperText-root": {
                            color: (theme) => theme.palette.secondary.main,
                          },
                          "& input::-webkit-clear-button, & input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                            {
                              display: "none",
                            },
                        }}
>>>>>>>> 30eec5e2076ea65502f8af77eb7e306834252569:src/Components/Settings/SettingsModules/Classic/classicManufacturingStructures.jsx
>>>>>>> 30eec5e2076ea65502f8af77eb7e306834252569
                        fullWidth={true}
                      >
                        <Autocomplete
                          disableClearable
                          fullWidth
                          id="System Search"
                          clearOnBlur
                          blurOnSelect
                          variant="standard"
                          size="small"
                          options={systemIDS}
                          getOptionLabel={(option) => option.name}
                          onChange={(event, value) => {
                            updateSystemIDValue(Number(value.id));
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
<<<<<<< HEAD
                              className={classes.Autocomplete}
=======
<<<<<<<< HEAD:src/Components/Settings/SettingsModules/Compact/compactManufacturingStructures.jsx
                              className={classes.Autocomplete}
========
>>>>>>>> 30eec5e2076ea65502f8af77eb7e306834252569:src/Components/Settings/SettingsModules/Classic/classicManufacturingStructures.jsx
>>>>>>> 30eec5e2076ea65502f8af77eb7e306834252569
                              margin="none"
                              variant="standard"
                              style={{ borderRadius: "5px" }}
                              InputProps={{
                                ...params.InputProps,
                                type: "System Name",
                              }}
                            />
                          )}
                        />
                        <FormHelperText variant="standard">
                          System Name
                        </FormHelperText>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} align="center">
                      <Tooltip title="Add new structure" arrow postion="bottom">
                        <IconButton size="small" color="primary" type="submit">
                          <AddIcon />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </form>
              </Box>
            </Masonry>
          </Grid>

          <Grid
            container
            item
            xs={12}
            lg={6}
            spacing={1}
            sx={{
              paddingLeft: "5px",
              paddingRight: "5px",
              paddingBottom: "5px",
              overflowY: "auto",
              height: { xs: "200px", lg: "380px" },
            }}
          >
            {users[parentUserIndex].settings.structures.manufacturing.map(
              (entry) => {
                const systemText =
                  structureOptions.manSystem[entry.systemType]?.label ||
                  "Missing System Type";

                const structureText =
                  structureOptions.manStructure[entry.structureType]?.label ||
                  "Missing Structure Type";

                const rigText =
                  structureOptions.manRigs[entry.rigType]?.label ||
                  "Missing Rig Type";

                const systemName =
                  systemIDS.find((i) => i.id === entry.systemID)?.name ||
                  "Missing System Name";

                return (
                  <Grid key={entry.id} item xs={12}>
                    <Card
                      raised={true}
                      sx={{
                        width: "100%",
                      }}
                    >
                      <CardContent>
                        <Grid container item xs={12} align="center">
                          <Grid
                            item
                            xs={12}
                            sx={{ flexWrap: "wrap", marginBottom: "10px" }}
                          >
                            <Typography
                              variant="h6"
                              sx={{ overflowWrap: "anywhere" }}
                              color="primary"
                            >
                              {entry.name}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="body1">
                              {systemText}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="body1">
                              {structureText}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="body1">{rigText}</Typography>
                          </Grid>
                          <Grid item xs={6}>
<<<<<<< HEAD
                            <Typography>
                              {`${entry.tax||0}%`}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography>
                              {systemName}
                            </Typography>
=======
                            <Typography>{`${entry.tax || 0}%`}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography>{systemName}</Typography>
>>>>>>> 30eec5e2076ea65502f8af77eb7e306834252569
                          </Grid>
                        </Grid>
                      </CardContent>{" "}
                      <CardActions>
                        <Grid container item xs={12}>
                          <Grid item xs={6} align="center">
                            <Button
                              size="small"
                              variant="contained"
                              disabled={entry.default}
                              onClick={() => {
                                let newUsersArray = [...users];
                                newUsersArray[
                                  parentUserIndex
                                ].settings.structures.manufacturing.forEach(
                                  (i) => {
                                    if (i.id === entry.id) {
                                      i.default = true;
                                    } else {
                                      i.default = false;
                                    }
                                  }
                                );
                                updateUsers(newUsersArray);
                                updateMainUserDoc(newUsersArray);
                              }}
                            >
                              Make Default
                            </Button>
                          </Grid>
                          <Grid item xs={6} align="center">
                            <Button
                              size="small"
                              variant="text"
                              color="error"
                              onClick={() => {
                                let newUsersArray = [...users];
                                newUsersArray[
                                  parentUserIndex
                                ].settings.structures.manufacturing =
                                  newUsersArray[
                                    parentUserIndex
                                  ].settings.structures.manufacturing.filter(
                                    (i) => i.id !== entry.id
                                  );
                                if (
                                  newUsersArray[parentUserIndex].settings
                                    .structures.manufacturing.length > 0 &&
                                  entry.default
                                ) {
                                  newUsersArray[
                                    parentUserIndex
                                  ].settings.structures.manufacturing[0].default = true;
                                }
                                updateUsers(newUsersArray);
                                updateMainUserDoc(newUsersArray);
                                logEvent(
                                  analytics,
                                  "Remove Manufacturing Structure",
                                  {
                                    UID: newUsersArray[parentUserIndex]
                                      .accountID,
                                  }
                                );
                              }}
                            >
                              Remove
                            </Button>
                          </Grid>
                        </Grid>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              }
            )}
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
}
