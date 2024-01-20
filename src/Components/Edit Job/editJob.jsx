import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ActiveJobContext, JobStatusContext } from "../../Context/JobContext";
import { useJobManagement } from "../../Hooks/useJobManagement";
import {
  Avatar,
  Divider,
  Grid,
  IconButton,
  Paper,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Tooltip,
  Typography,
} from "@mui/material";
import { CloseJobIcon } from "./closeIcon";
import { SaveJobIcon } from "./saveIcon";
import { DeleteJobIcon } from "./deleteIcon";
import { LinkedJobBadge } from "./Linked Job Badge";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { useOpenEditJob_New } from "../../Hooks/JobHooks/useOpenEditJob_New";
import { LoadingPage } from "../loadingPage";
import { LayoutSelector_EditJob_Planning } from "./Edit Job Components/Planning/layoutSelector";
import { LayoutSelector_EditJob_Purchasing } from "./Edit Job Components/Purchasing/layoutSelector";
import { LayoutSelector_EditJob_Building } from "./Edit Job Components/Building/layoutSelector";
import { LayoutSelector_EditJob_Complete } from "./Edit Job Components/Complete/LayoutSelector";
import { LayoutSelector_EditJob_Selling } from "./Edit Job Components/Selling/LayoutSelector";
import { ShoppingListDialog } from "../Job Planner/Dialogues/ShoppingList/ShoppingList";

export default function EditJob_New() {
  const { jobStatus } = useContext(JobStatusContext);
  const { activeJob: activeJobID } = useContext(ActiveJobContext);
  const [activeJob, updateActiveJob] = useState(null);
  const [jobModified, setJobModified] = useState(false);
  const [temporaryChildJobs, updateTemporaryChildJobs] = useState({});
  const [esiDataToLink, updateEsiDataToLink] = useState({
    industryJobs: {
      add: [],
      remove: [],
    },
    marketOrders: {
      add: [],
      remove: [],
    },
    transactions: {
      add: [],
      remove: [],
    },
  });
  const [parentChildToEdit, updateParentChildToEdit] = useState({
    parentJobs: {
      add: [],
      remove: [],
    },
    childJobs: {},
  });
  const { deepCopyJobObject } = useJobManagement();
  const { openEditJob } = useOpenEditJob_New();
  const navigate = useNavigate();
  const { jobID } = useParams();
  let backupJob = useRef(null);

  useEffect(() => {
    async function openJobProcess() {
      const matchedJob = await openEditJob(jobID);
      if (!matchedJob) {
        navigate("/jobplanner");
        return;
      }
      updateActiveJob(deepCopyJobObject(matchedJob));
      backupJob.current = deepCopyJobObject(matchedJob);
    }
    openJobProcess();
  }, [activeJobID]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  function stepBack() {
    updateActiveJob((prevState) => ({
      ...prevState,
      jobStatus: prevState.jobStatus - 1,
    }));
    setJobModified(true);
  }
  function stepForward() {
    updateActiveJob((prevState) => ({
      ...prevState,
      jobStatus: prevState.jobStatus + 1,
    }));
    setJobModified(true);
  }

  function StepContentSelector() {
    switch (activeJob.jobStatus) {
      case 0:
        return (
          <LayoutSelector_EditJob_Planning
            activeJob={activeJob}
            updateActiveJob={updateActiveJob}
            jobModified={jobModified}
            setJobModified={setJobModified}
            temporaryChildJobs={temporaryChildJobs}
            updateTemporaryChildJobs={updateTemporaryChildJobs}
            esiDataToLink={esiDataToLink}
            parentChildToEdit={parentChildToEdit}
            updateParentChildToEdit={updateParentChildToEdit}
          />
        );
      case 1:
        return (
          <LayoutSelector_EditJob_Purchasing
            activeJob={activeJob}
            updateActiveJob={updateActiveJob}
            setJobModified={setJobModified}
            parentChildToEdit={parentChildToEdit}
            updateParentChildToEdit={updateParentChildToEdit}
            temporaryChildJobs={temporaryChildJobs}
          />
        );
      case 2:
        return (
          <LayoutSelector_EditJob_Building
            activeJob={activeJob}
            updateActiveJob={updateActiveJob}
            setJobModified={setJobModified}
            esiDataToLink={esiDataToLink}
            updateEsiDataToLink={updateEsiDataToLink}
          />
        );
      case 3:
        return (
          <LayoutSelector_EditJob_Complete
            activeJob={activeJob}
            updateActiveJob={updateActiveJob}
            setJobModified={setJobModified}
          />
        );
      case 4:
        return (
          <LayoutSelector_EditJob_Selling
            activeJob={activeJob}
            updateActiveJob={updateActiveJob}
            setJobModified={setJobModified}
            esiDataToLink={esiDataToLink}
            updateEsiDataToLink={updateEsiDataToLink}
          />
        );
      default:
        return (
          <LayoutSelector_EditJob_Planning
            activeJob={activeJob}
            updateActiveJob={updateActiveJob}
            jobModified={jobModified}
            setJobModified={setJobModified}
            temporaryChildJobs={temporaryChildJobs}
            updateTemporaryChildJobs={updateTemporaryChildJobs}
            esiDataToLink={esiDataToLink}
            parentChildToEdit={parentChildToEdit}
            updateParentChildToEdit={updateParentChildToEdit}
          />
        );
    }
  }

  if (!activeJob) return <LoadingPage />;

  return (
    <Paper
      elevation={3}
      sx={{
        padding: "10px",
        marginTop: "20px",
        marginBottom: "20px",
        width: "100%",
      }}
      square
    >
      <ShoppingListDialog />
      <Grid container>
        <Grid item xs={7} md={9} lg={10} />
        <Grid item xs={5} md={3} lg={2} align="right">
          <DeleteJobIcon activeJob={activeJob} />
          <CloseJobIcon />
          <SaveJobIcon
            activeJob={activeJob}
            jobModified={jobModified}
            temporaryChildJobs={temporaryChildJobs}
            esiDataToLink={esiDataToLink}
            parentChildToEdit={parentChildToEdit}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h3" color="primary" align="left">
            {activeJob.name}
          </Typography>
        </Grid>
        <Grid item xs={2} />
        <Grid
          item
          xs={12}
          sm={5}
          align="center"
          sx={{ marginTop: { xs: "20px", md: "30px" } }}
        >
          <Avatar
            src={`https://images.evetech.net/types/${activeJob.itemID}/icon?size=32`}
            alt={activeJob.name}
            variant="square"
            sx={{
              height: { xs: "32px", sm: "64px" },
              width: { xs: "32px", sm: "64px" },
            }}
          />
        </Grid>
        <Grid item xs={12} sm={5} sx={{ marginTop: { xs: "10px", sm: "0px" } }}>
          <LinkedJobBadge
            activeJob={activeJob}
            updateActiveJob={updateActiveJob}
            jobModified={jobModified}
            setJobModified={setJobModified}
            parentChildToEdit={parentChildToEdit}
            updateParentChildToEdit={updateParentChildToEdit}
            temporaryChildJobs={temporaryChildJobs}
            esiDataToLink={esiDataToLink}
          />
        </Grid>
        <Grid item xs={12}>
          <Stepper activeStep={activeJob.jobStatus} orientation="vertical">
            {jobStatus.map((status) => {
              return (
                <Step
                  key={status.id}
                  sx={{
                    "& MuiStepIcon-text": {
                      fill: "#000",
                    },
                  }}
                >
                  <StepLabel>{status.name}</StepLabel>
                  <StepContent>
                    <Divider />
                    {activeJob.jobStatus !== 0 && (
                      <Grid item xs={12} align="center">
                        <Tooltip
                          title="Move to previous step"
                          arrow
                          placement="right"
                        >
                          <IconButton
                            color="primary"
                            onClick={stepBack}
                            size="large"
                          >
                            <ArrowUpwardIcon />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    )}
                    <StepContentSelector />
                    {activeJob.jobStatus !== jobStatus.length - 1 && (
                      <Grid item xs={12} align="center">
                        <Tooltip
                          title="Move to next step"
                          arrow
                          placement="right"
                        >
                          <IconButton
                            color="primary"
                            onClick={stepForward}
                            size="large"
                            disabled={
                              activeJob.groupID &&
                              !activeJob.isReadyToSell &&
                              activeJob.jobStatus === jobStatus.length - 2
                            }
                          >
                            <ArrowDownwardIcon />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    )}
                    <Divider />
                  </StepContent>
                </Step>
              );
            })}
          </Stepper>
        </Grid>
      </Grid>
    </Paper>
  );
}
