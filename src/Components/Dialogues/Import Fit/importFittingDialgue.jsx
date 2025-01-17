import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useImportFitFromClipboard } from "../../../Hooks/GroupHooks/useImportFitFromClipboard";
import { ImportFittingItemRow } from "./importFittingItemRow";
import { useHelperFunction } from "../../../Hooks/GeneralHooks/useHelperFunctions";

export function ImportItemFitDialogue({
  importFitDialogueTrigger,
  updateImportFitDialogueTrigger,
}) {
  const [clipboardReadAllowed, updateClipboardReadAllowed] = useState(false);
  const [importedItemList, updateImportedItemList] = useState([]);
  const [fitQuantityMultiplier, updateFitQuantityMultiplier] = useState(1);
  const { finalBuildRequests, importFromClipboard } =
    useImportFitFromClipboard();
  const { checkClipboardReadPermissions } = useHelperFunction();

  const handleClose = () => {
    updateClipboardReadAllowed(false);
    updateImportedItemList([]);
    updateFitQuantityMultiplier(1);
    updateImportFitDialogueTrigger((prev) => !prev);
  };

  useEffect(() => {
    async function checkClipboardPermission() {
      if (!importFitDialogueTrigger) return;

      const queryResult = await checkClipboardReadPermissions();
      if (!queryResult) {
        updateClipboardReadAllowed(queryResult);
        return;
      }
      const { importedItems } = await importFromClipboard();
      updateClipboardReadAllowed(queryResult);
      updateImportedItemList(importedItems);
    }
    checkClipboardPermission();
  }, [importFitDialogueTrigger]);
  return (
    <Dialog
      open={importFitDialogueTrigger}
      onClose={handleClose}
      sx={{ padding: "20px" }}
    >
      <DialogTitle color="primary" align="center">
        Import Fit
      </DialogTitle>
      <DialogContent>
        <Grid container>
          {!clipboardReadAllowed ? (
            <Grid item xs={12}>
              <Typography align="center"> No Access To Clipboard</Typography>
            </Grid>
          ) : importedItemList.length > 0 ? (
            importedItemList.map((item, index) => {
              return (
                <ImportFittingItemRow
                  key={item.itemID}
                  updateImportedItemList={updateImportedItemList}
                  item={item}
                  index={index}
                />
              );
            })
          ) : (
            <Grid item xs={12}>
              <Typography align="center">No Imported Items</Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ padding: "20px" }}>
        <Grid container>
          <Grid
            item
            xs={12}
            sm={3}
            sx={{ marginBottom: { xs: "20px", sm: "0px" } }}
          >
            <TextField
              disabled={importedItemList.length === 0 || !clipboardReadAllowed}
              fullWidth
              sx={{
                "& .MuiFormHelperText-root": {
                  color: (theme) => theme.palette.secondary.main,
                },
                "& input::-webkit-clear-button, & input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                  {
                    display: "none",
                  },
              }}
              size="size"
              variant="standard"
              helperText="Fit Quantity"
              type="number"
              value={fitQuantityMultiplier}
              InputProps={{ inputProps: { step: "1", min: 1 } }}
              onChange={(e) => {
                const newItemArray = importedItemList.map((entry) => {
                  entry.itemCalculatedQty =
                    entry.itemBaseQty * Math.round(e.target.value);
                  return entry;
                });
                updateImportedItemList(newItemArray);
                updateFitQuantityMultiplier(Math.round(e.target.value));
              }}
            />
          </Grid>
          <Grid item xs={3} sx={{ display: { xs: "none", sm: "block" } }} />
          <Grid item xs={6} sm={4} align="center">
            <Button
              disabled={importedItemList.length === 0 || !clipboardReadAllowed}
              size="small"
              variant="contained"
              onClick={async () => {
                await finalBuildRequests(importedItemList);
                handleClose();
              }}
            >
              Import Items
            </Button>
          </Grid>
          <Grid item xs={6} sm={2} align="center">
            <Button onClick={handleClose}>Close</Button>
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  );
}
