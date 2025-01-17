function getTooltipContent(job, timeRemaining) {
  switch (job.jobStatus) {
    case 0:
      return (
        <span>
          <p>Job Setups: {job.totalSetupCount}</p>
        </span>
      );
    case 1:
      if (job.totalComplete < job.totalMaterials) {
        return (
          <span>
            <p>
              Awaiting Materials: {job.totalMaterials - job.totalComplete}/
              {job.totalMaterials}
            </p>
          </span>
        );
      }
      return <p>Ready To Build</p>;
    case 2:
      return (
        <span>
          <p>ESI Jobs Linked: {job.apiJobs.size.toLocaleString()}</p>
          {job.apiJobs.size > 0 && (
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
          <p>Items Built: {job.itemQuantity.toLocaleString()}</p>
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

export default getTooltipContent;
