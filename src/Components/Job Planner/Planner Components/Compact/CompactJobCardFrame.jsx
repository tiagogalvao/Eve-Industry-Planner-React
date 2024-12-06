import { useContext, useMemo } from "react";
import { MultiSelectJobPlannerContext } from "../../../../Context/LayoutContext";
import { useDeleteSingleJob } from "../../../../Hooks/JobHooks/useDeleteSingleJob";
import { useDrag } from "react-dnd";
import { ItemTypes } from "../../../../Context/DnDTypes";
import { jobTypes } from "../../../../Context/defaultValues";
import InfoIcon from "@mui/icons-material/Info";
import DeleteIcon from "@mui/icons-material/Delete";
import { deepPurple, grey, lightGreen } from "@mui/material/colors";
import {
  Box,
  Button,
  Card,
  Checkbox,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import GLOBAL_CONFIG from "../../../../global-config-app";
import { useJobManagement } from "../../../../Hooks/useJobManagement";
import getTooltipContent from "./tooltipContent";

export function CompactJobCardFrame({ job }) {
  const { multiSelectJobPlanner, updateMultiSelectJobPlanner } = useContext(
    MultiSelectJobPlannerContext
  );
  const { timeRemainingCalc } = useJobManagement();
  const timeRemaining = timeRemainingCalc(job.endDateDisplay);
  const tooltipContent = getTooltipContent(job, timeRemaining);
  const { deleteSingleJob } = useDeleteSingleJob();
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.jobCard,
    item: {
      id: job.jobID,
      cardType: ItemTypes.jobCard,
      currentStatus: job.jobStatus,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  const { PRIMARY_THEME } = GLOBAL_CONFIG;

  const jobCardChecked = useMemo(
    () => multiSelectJobPlanner.some((i) => i === job.jobID),
    [multiSelectJobPlanner]
  );
  const navigate = useNavigate();

  function getCardColor(theme, jobType) {
    switch (jobType) {
      case jobTypes.manufacturing:
        return theme.palette.mode === PRIMARY_THEME
          ? `linear-gradient(to right, ${lightGreen[300]} 30%, ${grey[900]} 60%)`
          : `linear-gradient(to right, ${lightGreen[200]} 30%, white 60%)`;

      case jobTypes.reaction:
        return theme.palette.mode === PRIMARY_THEME
          ? `linear-gradient(to right, ${deepPurple[300]} 30%, ${grey[900]} 60%)`
          : `linear-gradient(to right, ${deepPurple[100]} 20%, white 60%)`;

      default:
        return "transparent";
    }
  }

  return (
    <Card
      ref={drag}
      elevation={2}
      square
      sx={(theme) => {
        const isDarkMode = theme.palette.mode === PRIMARY_THEME;
        const backgroundColor =
          jobCardChecked || isDragging
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
            checked={jobCardChecked}
            sx={{
              color: (theme) =>
                theme.palette.mode === PRIMARY_THEME
                  ? theme.palette.primary.main
                  : theme.palette.secondary.main,
            }}
            onChange={(event) => {
              if (event.target.checked) {
                updateMultiSelectJobPlanner((prev) => {
                  return [...new Set([...prev, job.jobID])];
                });
              } else {
                updateMultiSelectJobPlanner((prev) =>
                  prev.filter((i) => i !== job.jobID)
                );
              }
            }}
          />
        </Grid>
        <Grid container item xs={6} sm={8} alignItems="center">
          <Typography sx={{ typography: { xs: "caption", sm: "body2" } }}>
            {job.name}
          </Typography>
        </Grid>
        <Grid
          item
          sm={1}
          alignItems="center"
          justifyContent="center"
          sx={{
            display: { xs: "none", sm: "flex" },
            minHeight: "100%",
          }}
        >
          <Tooltip title={tooltipContent} arrow placement="left">
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <InfoIcon fontSize="small" color="primary" />
            </Box>
          </Tooltip>
        </Grid>
        <Grid container item xs={3} sm={1} align="center" alignItems="center">
          <Button
            color="primary"
            onClick={() => {
              navigate(`/editJob/${job.jobID}`);
            }}
          >
            Edit
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
              deleteSingleJob(job.jobID);
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
            background: (theme) => getCardColor(theme, job.jobType),
          }}
        />
      </Grid>
    </Card>
  );
}