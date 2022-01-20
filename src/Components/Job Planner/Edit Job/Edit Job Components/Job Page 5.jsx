import { useContext, useState } from "react";
import { Container, Grid } from "@mui/material";
import { ActiveJobContext } from "../../../../Context/JobContext";
import { EveIDsContext } from "../../../../Context/EveDataContext";
import {
  IsLoggedInContext,
  UsersContext,
} from "../../../../Context/AuthContext";
import { SalesStats } from "./Page 5 Components/salesStats";
import { AvailableMarketOrders } from "./Page 5 Components/availableMarketOrders";
import { LinkedMarketOrders } from "./Page 5 Components/linkedMarketOrders";
import { AvailableTransactionData } from "./Page 5 Components/availableTransactions";
import { LinkedTransactions } from "./Page 5 Components/linkedTransactions";
import { TutorialStep5 } from "./Page 5 Components/tutorialStep5";

export function EditPage5({ setJobModified }) {
  const { activeJob } = useContext(ActiveJobContext);
  const [showAvailableOrders, updateShowAvailableOrders] = useState(false);
  const [activeOrder, updateActiveOrder] = useState(null);
  const { users } = useContext(UsersContext);
  const { eveIDs } = useContext(EveIDsContext);
  const { isLoggedIn } = useContext(IsLoggedInContext);

  let itemOrderMatch = [];

  const parentUser = users.find((i) => i.ParentUser === true);

  if (isLoggedIn) {
    users.forEach((user) => {
      user.apiOrders.forEach((order) => {
        if (
          order.type_id === activeJob.itemID &&
          !activeJob.build.sale.marketOrders.includes(order.order_id)
        ) {
          eveIDs.find((item) => {
            if (item.id === order.location_id) {

              order.location_name = item.name;
            }
            if (item.id === order.region_id) {
              order.region_name = item.name;
            }
          });
          order.timeStamps = [];
          order.user_id = user.CharacterID;
          itemOrderMatch.push(order);
        }
      });
      user.apiHistOrders.forEach((order) => {
        if (
          order.type_id === activeJob.itemID &&
          !activeJob.build.sale.marketOrders.includes(order.order_id)
        ) {

          eveIDs.find((item) => {
            if (item.id === order.location_id) {

              order.location_name = item.name
            }
            if (item.id === order.region_id) {
              order.region_name = item.name
            }
          });
          order.timeStamps = [];
          order.user_id = user.CharacterID;
          itemOrderMatch.push(order);
        }
      });
    });
  }
  let transactionData = [];

  if (isLoggedIn) {
    activeJob.build.sale.marketOrders.forEach((order) => {
      const user = users.find((u) => u.CharacterID === order.user_id);

      const itemTrans = user.apiTransactions.filter(
        (trans) =>
          order.location_id === trans.location_id &&
          order.type_id === trans.type_id &&
          !trans.is_buy &&
          !parentUser.linkedTrans.includes(trans.transaction_id)
      );

      itemTrans.forEach((trans) => {
        const transJournal = user.apiJournal.find(
          (entry) => trans.transaction_id === entry.context_id
        );

        const transTax = user.apiJournal.find(
          (entry) =>
            entry.ref_type === "transaction_tax" &&
            Date.parse(entry.date) === Date.parse(trans.date)
        );
        trans.description = transJournal.description;
        trans.amount = transJournal.amount;
        trans.tax = Math.abs(transTax.amount);
        trans.order_id = null;

        transactionData.push(trans);
      });
    });
  }

  return (
    <Container disableGutters maxWidth="false">
      <Grid container spacing={2}>
        {!parentUser.settings.layout.hideTutorials && (
          <Grid item xs={12}>
            <TutorialStep5 />
          </Grid>
        )}
        <Grid item xs={12} md={8}>
          {activeJob.build.sale.marketOrders.length === 0 ||
          showAvailableOrders ? (
            <AvailableMarketOrders
              setJobModified={setJobModified}
              itemOrderMatch={itemOrderMatch}
              updateShowAvailableOrders={updateShowAvailableOrders}
            />
          ) : (
            <LinkedMarketOrders
              setJobModified={setJobModified}
              updateActiveOrder={updateActiveOrder}
              updateShowAvailableOrders={updateShowAvailableOrders}
            />
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <SalesStats />
        </Grid>
        <Grid item xs={12}>
          <AvailableTransactionData
            setJobModified={setJobModified}
            itemOrderMatch={itemOrderMatch}
            activeOrder={activeOrder}
            transactionData={transactionData}
          />
        </Grid>
        <Grid item xs={12}>

            <LinkedTransactions
              setJobModified={setJobModified}
              activeOrder={activeOrder}
            /> 
        </Grid>
      </Grid>
    </Container>
  );
}
