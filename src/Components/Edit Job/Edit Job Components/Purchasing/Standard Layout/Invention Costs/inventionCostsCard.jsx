import { useState } from "react";
import {
  Avatar,
  Chip,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import AddIcon from "@mui/icons-material/Add";
import {
  META_LEVELS_THAT_REQUIRE_INVENTION_COSTS,
  TWO_DECIMAL_PLACES,
  TYPE_IDS_TO_IGNORE_FOR_INVENTION_COSTS,
} from "../../../../../../Context/defaultValues";
import { useHelperFunction } from "../../../../../../Hooks/GeneralHooks/useHelperFunctions";
import Job from "../../../../../../Classes/jobConstructor";

export function InventionCostsCard({
  activeJob,
  updateActiveJob,
  setJobModified,
}) {
  const { sendSnackbarNotificationSuccess, sendSnackbarNotificationError } =
    useHelperFunction();
  const [inputs, setInputs] = useState({
    itemName: null,
    itemCost: 0,
  });

  function handleRemove(record) {
    activeJob.removeInventionCost(record);
    updateActiveJob((prev) => new Job(prev));
    sendSnackbarNotificationError("Deleted");
    setJobModified(true);
  }

  function handleSubmit(event) {
    event.preventDefault();

    activeJob.addInventionCost({
      id: Date.now(),
      itemName: inputs.itemName,
      itemCost: inputs.itemCost,
    });

    updateActiveJob((prev) => new Job(prev));
    sendSnackbarNotificationSuccess("Success");
    setInputs({ itemName: null, itemCost: 0 });
    setJobModified(true);
  }

  if (
    !META_LEVELS_THAT_REQUIRE_INVENTION_COSTS.has(activeJob.metaLevel) &&
    !TYPE_IDS_TO_IGNORE_FOR_INVENTION_COSTS.has(activeJob.itemID)
  )
    return null;

  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Paper
        sx={{
          padding: "20px",
          paddingTop: "10px",
          minHeight: { xs: "32vh", md: "30vh" },
          position: "relative",
        }}
        elevation={3}
        square
      >
        <Grid container>
          <Grid item xs={12} align="center">
            <Avatar
              variant="cirular"
              sx={{
                bgcolor: "primary.main",
                height: { xs: "32px", sm: "64px" },
                width: { xs: "32px", sm: "64px" },
              }}
            >
              <img
                src={"../images/invention.png"}
                alt=""
                style={{
                  height: { xs: "15px", sm: "35px" },
                  width: { xs: "15px", sm: "35px" },
                }}
              />
            </Avatar>
          </Grid>
          <Grid
            item
            xs={12}
            sx={{
              minHeight: "3rem",
              marginTop: "5px",
            }}
          >
            <Typography variant="subtitle2" align="center">
              Invention Costs
            </Typography>
          </Grid>
          <Grid container>
            <Grid item xs={12} sx={{ marginTop: "5px", height: "4.5rem" }}>
              <Typography sx={{ typography: { xs: "caption", sm: "body2" } }}>
                Total Cost:{" "}
                {activeJob.build.costs.inventionCosts.toLocaleString(
                  undefined,
                  TWO_DECIMAL_PLACES
                )}
              </Typography>
            </Grid>
          </Grid>
          <Grid
            container
            sx={{
              height: "7vh",
              overflowY: "auto",
            }}
          >
            {activeJob.build.costs.inventionEntries.map((record) => {
              return (
                <Grid
                  key={record.id}
                  container
                  item
                  justifyContent="center"
                  alignItems="center"
                  sx={{ marginBottom: "5px" }}
                >
                  <Chip
                    key={record.id}
                    label={`${record.itemName} ${record.itemCost.toLocaleString(
                      undefined,
                      TWO_DECIMAL_PLACES
                    )}`}
                    variant="outlined"
                    deleteIcon={<ClearIcon />}
                    sx={{
                      "& .MuiChip-deleteIcon": {
                        color: "error.main",
                      },
                      boxShadow: 2,
                    }}
                    onDelete={() => {
                      handleRemove(record);
                    }}
                    color="secondary"
                  />
                </Grid>
              );
            })}
          </Grid>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <TextField
                  sx={{
                    "& .MuiFormHelperText-root": {
                      color: (theme) => theme.palette.secondary.main,
                    },
                    "& input::-webkit-clear-button, & input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                      {
                        display: "none",
                      },
                  }}
                  required={true}
                  size="small"
                  variant="standard"
                  type="text"
                  helperText="Item"
                  onChange={(e) => {
                    const input = e.target.value.replace(/[^a-zA-Z0-9 ]/g, "");
                    setInputs((prevState) => ({
                      ...prevState,
                      itemName: input,
                    }));
                  }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  sx={{
                    "& .MuiFormHelperText-root": {
                      color: (theme) => theme.palette.secondary.main,
                    },
                  }}
                  required={true}
                  size="small"
                  variant="standard"
                  type="number"
                  helperText="Item Price"
                  defaultValue="0"
                  inputProps={{ step: "0.01" }}
                  onChange={(e) => {
                    setInputs((prevState) => ({
                      ...prevState,
                      itemCost: Number(e.target.value),
                    }));
                  }}
                />
              </Grid>
              <Grid item xs={1} align="center">
                <IconButton size="small" color="primary" type="submit">
                  <AddIcon />
                </IconButton>
              </Grid>
            </Grid>
          </form>
        </Grid>
      </Paper>
    </Grid>
  );
}
