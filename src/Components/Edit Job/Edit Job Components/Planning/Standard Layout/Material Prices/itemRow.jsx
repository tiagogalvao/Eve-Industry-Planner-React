import { useContext, useMemo, useState } from "react";
import { Grid, Icon, Tooltip, Typography } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { jobTypes } from "../../../../../../Context/defaultValues";
import GLOBAL_CONFIG from "../../../../../../global-config-app";
import { ChildJobPopoverFrame } from "./Child Job Pop Over/childJobPopoverFrame";
import { EvePricesContext } from "../../../../../../Context/EveDataContext";
import { JobArrayContext } from "../../../../../../Context/JobContext";
import { useGroupManagement } from "../../../../../../Hooks/useGroupManagement";
import { useMaterialCostCalculations } from "../../../../../../Hooks/GeneralHooks/useMaterialCostCalculations";

const { PRIMARY_THEME, SECONDARY_THEME } = GLOBAL_CONFIG;

export function MaterialCostRow_MaterialPricePanel({
  activeJob,
  updateActiveJob,
  material,
  marketSelect,
  listingSelect,
  jobModified,
  setJobModified,
  temporaryChildJobs,
  updateTemporaryChildJobs,
  setupToEdit,
  esiDataToLink,
  updateEsiDataToLink,
  parentChildToEdit,
  updateParentChildToEdit,
}) {
  const { jobArray } = useContext(JobArrayContext);
  const { evePrices } = useContext(EvePricesContext);
  const [displayPopover, updateDisplayPopover] = useState(null);
  const { calculateMaterialCostFromChildJobs } = useMaterialCostCalculations();
  const itemPriceObject = useMemo(
    () => evePrices.find((i) => i.typeID === material.typeID),
    [evePrices]
  );
  const marketObject = itemPriceObject[marketSelect];
  const currentMaterialPrice = itemPriceObject[marketSelect][listingSelect];

  const matchedChildJobs = jobArray.filter((i) =>
    activeJob.build.childJobs[material.typeID].includes(i.jobID)
  );
  if (temporaryChildJobs[material.typeID]) {
    const tempJobID = temporaryChildJobs[material.typeID].jobID;

    if (!matchedChildJobs.some((i) => i.jobID === tempJobID)) {
      matchedChildJobs.push(temporaryChildJobs[material.typeID]);
    }
  }
  if (parentChildToEdit.childJobs[material.typeID]?.add) {
    for (let id of parentChildToEdit.childJobs[material.typeID].add) {
      const match = jobArray.find((i) => i.jobID === id);
      if (!match) continue;
      matchedChildJobs.push(match);
    }
  }

  const matchedChildJobIDs = [
    ...activeJob.build.childJobs[material.typeID],
    ...(temporaryChildJobs[material.typeID]
      ? [temporaryChildJobs[material.typeID].jobID]
      : []),
    ...(parentChildToEdit.childJobs[material.typeID]?.add
      ? parentChildToEdit.childJobs[material.typeID].add
      : []),
  ];

  const totalPurchaseCost = currentMaterialPrice * material.quantity;
  const productionCostPerItem =
    Math.round(
      (calculateMaterialCostFromChildJobs(
        material,
        matchedChildJobIDs,
        matchedChildJobs,
        [],
        marketSelect,
        listingSelect
      ) /
        material.quantity +
        Number.EPSILON) *
        100
    ) / 100;

  return (
    <Grid
      container
      item
      xs={12}
      sx={{
        padding: { xs: "7px 0px", sm: "10px 0px" },
        backgroundColor: (theme) =>
          selectRowHighlightColor(theme, displayPopover),
      }}
    >
      <Grid
        justifyContent="center"
        item
        xs={2}
        sm={1}
        sx={{
          display: { xs: "flex", md: "flex" },
          paddingRight: "5px",
        }}
      >
        <img
          src={`https://images.evetech.net/types/${material.typeID}/icon?size=32`}
          alt=""
        />
      </Grid>
      <Grid container item xs={10} md={4} align="left">
        <Grid item xs={11} alignItems="center" sx={{ display: "flex" }}>
          <Typography sx={{ typography: { xs: "caption", sm: "body1" } }}>
            {material.name}
          </Typography>
        </Grid>
        <Grid
          item
          xs={1}
          alignItems="center"
          justifyContent="center"
          sx={{ display: "flex" }}
        >
          {material.jobType === jobTypes.manufacturing ||
          material.jobType === jobTypes.reaction ? (
            <>
              <Tooltip
                title="Click To Compare Material Build Cost"
                arrow
                placement="bottom"
              >
                <Icon
                  aria-haspopup="true"
                  color="primary"
                  onClick={(event) => {
                    updateDisplayPopover(event.currentTarget);
                  }}
                >
                  <InfoIcon fontSize="small" />
                </Icon>
              </Tooltip>
              <ChildJobPopoverFrame
                activeJob={activeJob}
                updateActiveJob={updateActiveJob}
                displayPopover={displayPopover}
                updateDisplayPopover={updateDisplayPopover}
                material={material}
                marketSelect={marketSelect}
                listingSelect={listingSelect}
                jobModified={jobModified}
                setJobModified={setJobModified}
                temporaryChildJobs={temporaryChildJobs}
                updateTemporaryChildJobs={updateTemporaryChildJobs}
                currentMaterialPrice={currentMaterialPrice}
                matchedChildJobs={matchedChildJobs}
                setupToEdit={setupToEdit}
                esiDataToLink={esiDataToLink}
                updateEsiDataToLink={updateEsiDataToLink}
                parentChildToEdit={parentChildToEdit}
                updateParentChildToEdit={updateParentChildToEdit}
              />
            </>
          ) : null}
        </Grid>
      </Grid>
      <Grid
        alignItems="center"
        justifyContent="center"
        container
        item
        xs={6}
        md={3}
        align="center"
        sx={{
          marginTop: { xs: "10px", md: "0px" },
          display: "flex",
        }}
      >
        <Grid item xs={12}>
          <Tooltip
            title={
              <span>
                <p>
                  <b>30 Day Region Market History</b>
                </p>
                <p>
                  Highest Market Price:{" "}
                  {marketObject.highestMarketPrice.toLocaleString()}
                </p>
                <p>
                  Lowest Market Price:{" "}
                  {marketObject.lowestMarketPrice.toLocaleString()}
                </p>
                <p>
                  Daily Average Market Price:{" "}
                  {marketObject.dailyAverageMarketPrice.toLocaleString()}
                </p>
                <p>
                  Daily Average Order Quantity:{" "}
                  {marketObject.dailyAverageOrderQuantity.toLocaleString()}
                </p>
                <p>
                  Daily Average Unit Count:{" "}
                  {marketObject.dailyAverageUnitCount.toLocaleString()}
                </p>
              </span>
            }
            arrow
            placement="top"
          >
            <Typography
              sx={{ typography: { xs: "caption", sm: "body2" } }}
              color={selectTextHighlight(
                currentMaterialPrice,
                productionCostPerItem,
                true
              )}
            >
              {currentMaterialPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
          </Tooltip>
        </Grid>
        {(material.jobType === jobTypes.manufacturing ||
          material.jobType === jobTypes.reaction) && (
          <Grid item xs={12} sx={{ marginTop: 1 }}>
            <Typography
              sx={{ typography: { xs: "caption", sm: "body2" } }}
              color={selectTextHighlight(
                currentMaterialPrice,
                productionCostPerItem,
                false
              )}
            >
              <i>
                {matchedChildJobs.length > 0
                  ? productionCostPerItem.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "-"}
              </i>
            </Typography>
          </Grid>
        )}
      </Grid>
      <Grid
        alignItems="center"
        justifyContent="center"
        container
        item
        xs={6}
        md={4}
        align="center"
        sx={{ marginTop: { xs: "10px", md: "0px" }, display: "flex" }}
      >
        <Grid item xs={12}>
          <Typography
            sx={{ typography: { xs: "caption", sm: "body2" } }}
            color={selectTextHighlight(
              currentMaterialPrice,
              productionCostPerItem,
              true
            )}
          >
            {totalPurchaseCost.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Typography>
        </Grid>
        {(material.jobType === jobTypes.manufacturing ||
          material.jobType === jobTypes.reaction) && (
          <Grid item xs={12}>
            <Typography
              sx={{ typography: { xs: "caption", sm: "body2" } }}
              color={selectTextHighlight(
                currentMaterialPrice,
                productionCostPerItem,
                false
              )}
            >
              <i>
                {matchedChildJobIDs.length > 0
                  ? (productionCostPerItem * material.quantity).toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )
                  : "-"}
              </i>
            </Typography>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
}

function selectRowHighlightColor(theme, displayPopover) {
  if (!displayPopover) return null;

  switch (theme.palette.mode) {
    case PRIMARY_THEME:
      return theme.palette.secondary.highlight;

    case SECONDARY_THEME:
      return theme.palette.secondary.highlight;

    default:
      return theme.palette.secondary.main;
  }
}

function selectTextHighlight(
  currentMaterialPrice,
  calculatedChildPrice,
  highlightIfGreater
) {
  if (calculatedChildPrice === 0) return null;

  if (currentMaterialPrice == calculatedChildPrice) return null;

  if (
    (highlightIfGreater && currentMaterialPrice >= calculatedChildPrice) ||
    (!highlightIfGreater && currentMaterialPrice <= calculatedChildPrice)
  ) {
    return "error.main";
  } else {
    return "success.main";
  }
}
