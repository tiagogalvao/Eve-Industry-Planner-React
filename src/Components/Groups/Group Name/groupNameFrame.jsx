import { useContext, useEffect, useState } from "react";
import {
  Grid,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { ActiveJobContext, JobArrayContext } from "../../../Context/JobContext";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";

function GroupNameFrame({}) {
  const { activeGroup } = useContext(ActiveJobContext);
  const { groupArray, updateGroupArray } = useContext(JobArrayContext);
  const selectedGroup = groupArray.find((i) => i.groupID === activeGroup);
  const [allowEditGroupName, updateAllowEditGroupName] = useState(false);
  const [editGroupNameText, updateEditGroupNameText] = useState("");

  useEffect(() => {
    if (selectedGroup) {
      updateEditGroupNameText(selectedGroup.groupName);
    }
  }, [selectedGroup]);

  if (!selectedGroup) return null;

  function handleSave() {
    selectedGroup.setGroupName(editGroupNameText);
    updateGroupArray([...groupArray]);
    updateAllowEditGroupName((prev) => !prev);
  }
  function handleClose() {
    updateEditGroupNameText(selectedGroup.groupName);
    updateAllowEditGroupName(false);
  }

  return (
    <Paper
      elevation={3}
      square
      sx={{
        display: "flex",
        padding: "10px",
        width: "100%",
      }}
    >
      {!allowEditGroupName ? (
        <Grid container sx={{ width: "100%" }}>
          <Grid item xs={11}>
            <Typography variant="h5" align="left" color="primary">
              {selectedGroup.groupName}
            </Typography>
          </Grid>
          <Grid item xs={1} align="center">
            <Tooltip title="Edit Group Name" arrow placement="bottom">
              <IconButton
                size="small"
                onClick={() => updateAllowEditGroupName((prev) => !prev)}
              >
                <EditIcon color="primary" />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      ) : (
        <Grid container sx={{ width: "100%" }}>
          <Grid item xs={10}>
            <TextField
              variant="standard"
              value={editGroupNameText}
              sx={{ width: "100%" }}
              onChange={(e) => updateEditGroupNameText(e.target.value)}
            />
          </Grid>
          <Grid item xs={2} align="right">
            <Tooltip title="Save Changes" arrow placement="bottom">
              <IconButton
                size="small"
                sx={{
                  "&:hover": {
                    "& .MuiSvgIcon-root": {
                      color: "success.main",
                    },
                  },
                }}
                onClick={handleSave}
              >
                <SaveIcon color="primary" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Revert Changes" arrow placement="bottom">
              <IconButton
                size="small"
                sx={{
                  "&:hover": {
                    "& .MuiSvgIcon-root": {
                      color: "error.main",
                    },
                  },
                }}
                onClick={handleClose}
              >
                <CloseIcon color="primary" />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      )}
    </Paper>
  );
}

export default GroupNameFrame;
