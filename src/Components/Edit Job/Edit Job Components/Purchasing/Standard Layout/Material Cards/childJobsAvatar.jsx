import { Avatar, Tooltip } from "@mui/material";
import checkJobTypeIsBuildable from "../../../../../../Functions/Helper/checkJobTypeIsBuildable";

export function ChildJobsAvatar_Purchasing({
  material,
  updateChildDialogTrigger,
  childJobs,
}) {
  const displayItem = checkJobTypeIsBuildable(material.jobType);

  if (!displayItem) return null;

  return (
    <Tooltip
      title="Number of child jobs linked, click to add or remove."
      arrow
      placement="top"
    >
      <Avatar
        variant="circle"
        sx={{
          color: "white",
          bgcolor: "primary.main",
          height: "30px",
          width: "30px",
          position: "absolute",
          top: "5px",
          left: "5px",
          cursor: "pointer",
          boxShadow: 4,
        }}
        onClick={() => {
          updateChildDialogTrigger((prev) => !prev);
        }}
      >
        {childJobs.length}
      </Avatar>
    </Tooltip>
  );
}
