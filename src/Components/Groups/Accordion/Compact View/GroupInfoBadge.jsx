import { Box, Tooltip } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { useJobManagement } from "../../../../Hooks/useJobManagement";

function getTooltipContent(job, timeRemainingCalc) {
  switch (job.jobStatus) {
    case 0:
      const totalSetupCount = Object.values(job.build.setup).reduce(
        (prev, setup) => {
          return prev + 1;
        },
        0
      );
      return (
        <span>
          <p>Quantity: {job.build.products.totalQuantity.toLocaleString()}</p>
          <p>Job Setups: {totalSetupCount.toLocaleString()} </p>
        </span>
      );
    case 1:
      const totalComplete = job.build.materials.reduce((res, mat) => {
        if (mat.purchaseComplete) {
          res++;
        }
        return res;
      }, 0);

      if (totalComplete < job.totalMaterials) {
        return (
          <span>
            <p>
              Awaiting Materials: {job.totalMaterials - totalComplete}/
              {job.totalMaterials}
            </p>
          </span>
        );
      }
      return <p>Ready To Build</p>;
    case 2:
      const timeRemaining = sortJobs(job, timeRemainingCalc);

      return (
        <span>
          <p>ESI Jobs Linked: {job.apiJobs.size.toLocaleString()}</p>
          {job.apiJobs.length > 0 && (
            <p>
              {timeRemaining === "complete"
                ? "Complete"
                : `Ends In: ${timeRemaining}`}
            </p>
          )}
        </span>
      );
    case 3:
      return (
        <span>
          <p>
            Items Built: {job.build.products.totalQuantity.toLocaleString()}
          </p>
          <p>
            Item Cost:{" "}
            {(
              Math.round(
                ((job.build.costs.extrasTotal +
                  job.build.costs.installCosts +
                  job.build.costs.totalPurchaseCost) /
                  job.build.products.totalQuantity +
                  Number.EPSILON) *
                  100
              ) / 100
            ).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </span>
      );
    case 4:
      return (
        <span>
          <p>Market Orders: {job.apiOrders.size.toLocaleString()}</p>
          <p>Transactions: {job.apiTransactions.size.toLocaleString()} </p>
        </span>
      );
    default:
      return null;
  }
}

export default function GroupInfoPopout({ job }) {
  const { timeRemainingCalc } = useJobManagement();
  const tooltipContent = getTooltipContent(job, timeRemainingCalc);

  if (!tooltipContent) {
    return null;
  }

  return (
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
  );
}

function sortJobs(job, timeRemainingCalc) {
  let tempJobs = [...job.build.costs.linkedJobs];
  if (tempJobs.length === 0) return null;

  tempJobs.sort((a, b) => {
    if (Date.parse(a.end_date) > Date.parse(b.end_date)) {
      return 1;
    }
    if (Date.parse(a.end_date) < Date.parse(b.end_date)) {
      return -1;
    }
    return 0;
  });
  return timeRemainingCalc(Date.parse(tempJobs[0].end_date));
}
