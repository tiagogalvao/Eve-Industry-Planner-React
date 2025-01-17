import { Tooltip, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDeleteSingleJob } from "../../Hooks/JobHooks/useDeleteSingleJob";
import { useLocation, useNavigate } from "react-router-dom";

export function DeleteJobIcon({ activeJob }) {
  const { deleteSingleJob } = useDeleteSingleJob();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  return (
    <Tooltip
      title="Deletes the job from the job planner."
      arrow
      placement="bottom"
    >
      <IconButton
        variant="contained"
        color="error"
        onClick={async () => {
          await deleteSingleJob(activeJob.jobID);
          const groupIDFromParams = queryParams.get("activeGroup");
          const returnURL = groupIDFromParams
            ? `/group/${groupIDFromParams}`
            : "/jobplanner";
          navigate(returnURL);
        }}
        size="medium"
        sx={{ marginRight: { xs: "20px", sm: "40px" } }}
      >
        <DeleteIcon />
      </IconButton>
    </Tooltip>
  );
}
