import { useDrag } from "react-dnd";
import { ItemTypes } from "../../../../Context/DnDTypes";
import {
  Button,
  Card,
  Checkbox,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useContext, useMemo } from "react";
import {
  JobPlannerPageTriggerContext,
  MultiSelectJobPlannerContext,
} from "../../../../Context/LayoutContext";
import { grey, yellow } from "@mui/material/colors";
import { useOpenGroup } from "../../../../Hooks/GroupHooks/useOpenGroup";
import { useGroupManagement } from "../../../../Hooks/useGroupManagement";
import GLOBAL_CONFIG from "../../../../global-config-app";
import { useNavigate } from "react-router-dom";

export function CompactGroupJobCard({ group }) {
  const { multiSelectJobPlanner, updateMultiSelectJobPlanner } = useContext(
    MultiSelectJobPlannerContext
  );
  const { updateEditGroupTrigger } = useContext(JobPlannerPageTriggerContext);
  const { openGroup } = useOpenGroup();
  const { deleteGroupWithoutJobs } = useGroupManagement();
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.groupCard,
    item: {
      id: group.groupID,
      cardType: ItemTypes.groupCard,
      currentStatus: group.groupStatus,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  const navigate = useNavigate();
  const { PRIMARY_THEME } = GLOBAL_CONFIG;

  const groupCardChecked = useMemo(
    () => multiSelectJobPlanner.includes(group.groupID),
    [multiSelectJobPlanner]
  );

  return (
    <Card
      ref={drag}
      square
      sx={(theme) => {
        const isDarkMode = theme.palette.mode === PRIMARY_THEME;
        const backgroundColor =
          groupCardChecked || isDragging
            ? isDarkMode
              ? grey[900]
              : grey[300]
            : undefined;
        const borderColor = isDarkMode ? grey[700] : grey[400];
        return {
          marginTop: "5px",
          marginBottom: "5px",
          cursor: "grab",
          backgroundColor,
          transition: "border 0.3s ease",
          border: `2px solid transparent`,
          "&:hover": {
            border: `2px solid ${borderColor}`,
          },
        };
      }}
    >
      <Grid container item xs={12}>
        <Grid item xs={2} sm={1} align="center">
          <Checkbox
            sx={{
              color: (theme) =>
                theme.palette.mode === PRIMARY_THEME
                  ? theme.palette.primary.main
                  : theme.palette.secondary.main,
            }}
            checked={groupCardChecked}
            onChange={(event) => {
              if (event.target.checked) {
                updateMultiSelectJobPlanner((prev) => {
                  return [...new Set([...prev, group.groupID])];
                });
              } else {
                updateMultiSelectJobPlanner((prev) =>
                  prev.filter((i) => i !== group.groupID)
                );
              }
            }}
          />
        </Grid>
        <Grid container item xs={6} sm={9} alignItems="center">
          <Typography sx={{ typography: { xs: "caption", sm: "body2" } }}>
            {group.groupName}
          </Typography>
        </Grid>
        <Grid container item xs={3} sm={1} align="center" alignItems="center">
          <Button
            color="primary"
            onClick={() => navigate(`/group/${group.groupID}`)}
          >
            View
          </Button>
        </Grid>
        <Grid container item xs={1} align="center" alignItems="center">
          <IconButton
            sx={{
              color: (theme) =>
                theme.palette.mode === PRIMARY_THEME
                  ? theme.palette.primary.main
                  : theme.palette.secondary.main,
              "&:Hover": {
                color: "error.main",
              },
            }}
            onClick={() => {
              deleteGroupWithoutJobs(group.groupID);
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Grid>
        <Grid
          item
          xs={12}
          sx={{
            height: "2px",
            background: (theme) =>
              theme.palette.mode === PRIMARY_THEME
                ? `linear-gradient(to right, ${yellow[600]} 30%, ${grey[900]} 60%)`
                : `linear-gradient(to right, ${yellow[600]} 20%, white 60%)`,
          }}
        />
      </Grid>
    </Card>
  );
}
