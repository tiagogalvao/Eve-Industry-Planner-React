import { useContext } from "react";
import {
  Autocomplete,
  Button,
  CircularProgress,
  Grid,
  Paper,
  TextField,
  Tooltip,
} from "@mui/material";
import itemList from "../../../RawData/searchIndex.json";
import { useJobManagement } from "../../../Hooks/useJobManagement";
import {
  DataExchangeContext,
  ShoppingListContext,
} from "../../../Context/LayoutContext";

import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  Autocomplete: {
    "& .MuiInputBase-input.MuiAutocomplete-input": {
      color:
        theme.palette.type === "dark" ? "black" : theme.palette.secondary.main,
    },
  },
}));

export function SearchBar({ multiSelect, updateMultiSelect }) {
  const { DataExchange } = useContext(DataExchangeContext);
  const { updateShoppingListData } = useContext(ShoppingListContext);
  const {
    deleteMultipleJobsProcess,
    massBuildMaterials,
    moveMultipleJobsBackward,
    moveMultipleJobsForward,
    newJobProcess,
    buildShoppingList,
  } = useJobManagement();
  const classes = useStyles();

  return (
    <Paper
      sx={{
        padding: "20px",
        marginRight: { md: "10px" },
        marginLeft: { md: "10px" },
      }}
      elevation={3}
      square={true}
    >
      <Grid container direction="row" alignItems="center">
        <Grid item xs={11} sm={5} md={4} xl={2}>
          <Autocomplete
            disableClearable={true}
            fullWidth
            freeSolo
            id="Recipe Search"
            clearOnBlur={true}
            blurOnSelect={true}
            variant="standard"
            size="small"
            options={itemList}
            getOptionLabel={(option) => option.name}
            onChange={(event, value) => {
              if (value != null) {
                newJobProcess(value.itemID, null);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                label="Item Search"
                className={classes.Autocomplete}
                margin="none"
                variant="standard"
                style={{ background: "white", borderRadius: "5px" }}
                InputProps={{ ...params.InputProps, type: "search" }}
              />
            )}
          />
        </Grid>

        <Grid item xs={1} sx={{ paddingLeft: { xs: "5px", md: "20px" } }}>
          {DataExchange && <CircularProgress size="24px" edge="false" />}
        </Grid>

        {multiSelect.length > 0 && (
          <Grid
            container
            item
            xs={12}
            xl={9}
            sx={{ marginTop: "20px" }}
            align="center"
          >
            <Grid
              item
              xs={12}
              md="auto"
              align="center"
              sx={{ marginBottom: { xs: "10px", md: "0px" } }}
            >
              <Tooltip
                title="Displays a shopping list of materials to build all of the selected jobs, this does not currently take into account any items you may have already marked as purchased."
                arrow
              >
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ marginRight: "10px" }}
                  onClick={async () => {
                    let shoppingList = await buildShoppingList(multiSelect);
                    updateShoppingListData((prev) => ({
                      open: true,
                      list: shoppingList,
                    }));
                  }}
                >
                  Shopping List
                </Button>
              </Tooltip>
              <Tooltip
                title="Sets up new jobs to build the combined ingrediant total of each selected job."
                arrow
              >
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ marginRight: "10px" }}
                  onClick={() => {
                    massBuildMaterials(multiSelect);
                    updateMultiSelect([]);
                  }}
                >
                  Add Ingrediant Jobs
                </Button>
              </Tooltip>
            </Grid>
            <Grid
              item
              xs={12}
              md="auto"
              align="center"
              sx={{ marginBottom: { xs: "10px", md: "0px" } }}
            >
              <Tooltip title="Moves the selected jobs 1 step backwards." arrow>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ marginRight: "10px" }}
                  onClick={() => {
                    moveMultipleJobsBackward(multiSelect);
                    updateMultiSelect([]);
                  }}
                >
                  Move Backward
                </Button>
              </Tooltip>
              <Tooltip title="Moves the selected jobs 1 step forwards." arrow>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ marginRight: "10px" }}
                  onClick={() => {
                    moveMultipleJobsForward(multiSelect);
                    updateMultiSelect([]);
                  }}
                >
                  Move Forward
                </Button>
              </Tooltip>
            </Grid>
            <Grid
              item
              xs={12}
              md="auto"
              align="center"
              sx={{ marginBottom: { xs: "20px", md: "0px" } }}
            >
              <Tooltip title="Clears the selected jobs." arrow>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ marginRight: "30px" }}
                  onClick={() => {
                    updateMultiSelect([]);
                  }}
                >
                  Clear Selection
                </Button>
              </Tooltip>
            </Grid>
            <Grid item xs={12} md="auto" align="center">
              <Tooltip title="Deletes the selected jobs from the planner." arrow>
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  onClick={() => {
                    deleteMultipleJobsProcess(multiSelect);
                    updateMultiSelect([]);
                  }}
                >
                  Delete
                </Button>
              </Tooltip>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
}
