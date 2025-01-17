import {
  Box,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import { AddWatchItemDialog } from "./AddItemDialog/dialogFrame";
import { useContext, useMemo, useState } from "react";
import { UsersContext } from "../../../../Context/AuthContext";
import { AddGroupDialog } from "./addGroupDialog";
import { GroupSettingsDialog } from "./groupSettings";
import { WatchlistContainer } from "./itemWatchContainer";
import { UserLoginUIContext } from "../../../../Context/LayoutContext";
import { useHelperFunction } from "../../../../Hooks/GeneralHooks/useHelperFunctions";

export function ItemWatchPanel() {
  const { users } = useContext(UsersContext);
  const { userWatchlistDataFetch } = useContext(UserLoginUIContext);
  const [openDialog, setOpenDialog] = useState(false);
  const [watchlistItemToEdit, updateWatchlistItemToEdit] = useState(null);
  const [addNewGroupTrigger, updateAddNewGroupTrigger] = useState(false);
  const [groupSettingsTrigger, updateGroupSettingsTrigger] = useState(false);
  const [groupSettingsContent, updateGroupSettingsContent] = useState({
    name: "",
  });
  const { findParentUser } = useHelperFunction();

  const parentUser = findParentUser();

  if (!userWatchlistDataFetch) {
    return (
      <Paper
        sx={{
          padding: "20px",
          position: "relative",
          marginLeft: {
            xs: "5px",
            md: "10px",
          },
          marginRight: {
            xs: "5px",
            md: "10px",
          },
        }}
        square
        elevation={3}
      >
        <Grid container item xs={12}>
          <Grid item xs={12} align="center">
            <CircularProgress color="primary" />
          </Grid>
          <Grid item xs={12} align="center">
            <Typography sx={{ typography: { xs: "caption", sm: "body2" } }}>
              Building Watchlist Data
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    );
  }
  return (
    <Paper
      sx={{
        padding: "20px",
        position: "relative",
        marginLeft: {
          xs: "5px",
          md: "10px",
        },
        marginRight: {
          xs: "5px",
          md: "10px",
        },
      }}
      square
      elevation={3}
    >
      <AddWatchItemDialog
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        watchlistItemToEdit={watchlistItemToEdit}
        updateWatchlistItemToEdit={updateWatchlistItemToEdit}
      />
      <AddGroupDialog
        parentUser={parentUser}
        addNewGroupTrigger={addNewGroupTrigger}
        updateAddNewGroupTrigger={updateAddNewGroupTrigger}
      />
      <GroupSettingsDialog
        groupSettingsTrigger={groupSettingsTrigger}
        updateGroupSettingsTrigger={updateGroupSettingsTrigger}
        groupSettingsContent={groupSettingsContent}
      />
      <Grid container>
        <Grid item xs={12} sx={{ marginBottom: { xs: "20px", sm: "40px" } }}>
          <Typography variant="h5" color="primary" align="center">
            Item Watchlist
          </Typography>
        </Grid>
        <Box sx={{ position: "absolute", top: "10px", right: "10px" }}>
          <Tooltip title="Add New Watchlist Group" arrow placement="bottom">
            <IconButton
              color="primary"
              onClick={() => {
                updateAddNewGroupTrigger((prev) => !prev);
              }}
            >
              <PlaylistAddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Item To Watchlist" arrow placement="bottom">
            <IconButton
              color="primary"
              onClick={() => {
                setOpenDialog(true);
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Grid container item xs={12}>
          <WatchlistContainer
            parentUser={parentUser}
            updateGroupSettingsTrigger={updateGroupSettingsTrigger}
            groupSettingsContent={groupSettingsContent}
            updateGroupSettingsContent={updateGroupSettingsContent}
            setOpenDialog={setOpenDialog}
            updateWatchlistItemToEdit={updateWatchlistItemToEdit}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
