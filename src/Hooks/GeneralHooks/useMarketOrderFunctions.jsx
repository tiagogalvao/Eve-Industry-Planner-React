import { useContext } from "react";
import { LinkedIDsContext } from "../../Context/JobContext";
import {
  CorpEsiDataContext,
  PersonalESIDataContext,
} from "../../Context/EveDataContext";
import { useHelperFunction } from "./useHelperFunctions";

export function useMarketOrderFunctions() {
  const { linkedOrderIDs, linkedTransIDs } = useContext(LinkedIDsContext);
  const { esiOrders, esiHistOrders, esiJournal, esiTransactions } = useContext(
    PersonalESIDataContext
  );
  const {
    corpEsiOrders,
    corpEsiHistOrders,
    corpEsiJournal,
    corpEsiTransactions,
  } = useContext(CorpEsiDataContext);
  const { findParentUser } = useHelperFunction();
  const parentUser = findParentUser();

  function Transaction(trans, desc, journal, tax, CharacterHash) {
    this.order_id = null;
    this.journal_ref_id = trans.journal_ref_id;
    this.unit_price = trans.unit_price;
    this.amount = journal?.amount || 0;
    this.tax = Math.abs(tax?.amount) || 0;
    this.transaction_id = trans.transaction_id;
    this.quantity = trans.quantity;
    this.date = trans.date;
    this.location_id = trans.location_id;
    this.is_corp = !trans.is_personal;
    this.type_id = trans.type_id;
    this.description = desc;
    this.CharacterHash = CharacterHash;
  }

  function ESIMarketOrder(order) {
    this.duration = order.duration;
    this.is_corporation = order.is_corporation;
    this.issued = order.issued;
    this.location_id = order.location_id;
    this.order_id = order.order_id;
    this.item_price = order.price;
    this.range = order.range;
    this.region_id = order.region_id;
    this.type_id = order.type_id;
    this.volume_remain = order.volume_remain;
    this.volume_total = order.volume_total;
    this.timeStamps = [order.issued];
    this.CharacterHash = order.CharacterHash;
    this.complete = order.complete || false;
  }

  function ESIBrokerFee(entry, order, brokersFee) {
    this.order_id = order.order_id;
    this.id = entry.id;
    this.complete = false;
    this.date = entry.date;
    this.amount = brokersFee || 0;
    this.CharacterHash = order.CharacterHash;
  }

  function findJournalEntry(transaction) {
    const journalEntries = [
      ...esiJournal.flatMap((entry) => entry?.data ?? []),
      ...corpEsiJournal.flatMap((user) =>
        user?.data.flatMap(({ data }) => data ?? [])
      ),
    ];

    return journalEntries.find(
      (entry) => transaction?.transaction_id === entry?.context_id
    );
  }

  function findTransactionTax(transaction) {
    const journalEntries = [
      ...esiJournal.flatMap((entry) => entry?.data ?? []),
      ...corpEsiJournal.flatMap((user) =>
        user?.data.flatMap(({ data }) => data ?? [])
      ),
    ];

    return journalEntries.find(
      (entry) =>
        entry?.ref_type === "transaction_tax" &&
        Date.parse(entry?.date) === Date.parse(transaction?.date)
    );
  }

  function findMarketOrdersForItem(inputJob, temporaryOrderIDs = []) {
    const matchingMarketOrders = [];
    [esiOrders, esiHistOrders].forEach((orders) => {
      orders.forEach((entry) => {
        entry?.data.forEach((order) => {
          const criteriaIsMet = orderCriteria(order);
          if (criteriaIsMet) {
            matchingMarketOrders.push(order);
          }
        });
      });
    });

    const combinedCorpOrders = [corpEsiOrders, corpEsiHistOrders]
      .map((map) => Array.from(map.values()))
      .flat()
      .filter((obj) => Object.keys(obj).length > 0)
      .map(Object.values)
      .reduce((acc, val) => acc.concat(val), []);

    combinedCorpOrders.forEach((order) => {
      const criteriaIsMet = orderCriteria(order);
      if (criteriaIsMet) {
        matchingMarketOrders.push(order);
      }
    });

    function orderCriteria(order) {
      if (
        order.type_id === inputJob.itemID &&
        !linkedOrderIDs.includes(order.order_id) &&
        !parentUser.linkedOrders.has(order.order_id) &&
        !matchingMarketOrders.some((i) => i.order_id === order.order_id) &&
        !temporaryOrderIDs.some((i) => i === order.order_id)
      ) {
        return true;
      }
      return false;
    }

    return matchingMarketOrders;
  }

  function findTransactionsForMarketOrders(
    order,
    existingMatchedTransactionIDs = new Set()
  ) {
    const existingTransactions = [];
    const transactions = [
      ...esiTransactions.flatMap((entry) => entry?.data ?? []),
      ...corpEsiTransactions.flatMap((user) =>
        user?.data.flatMap(({ data }) => data ?? [])
      ),
    ];
    transactions.forEach((trans) => {
      if (
        order.location_id === trans.location_id &&
        order.type_id === trans.type_id &&
        !linkedTransIDs.includes(trans.transaction_id) &&
        !parentUser.linkedTrans.has(trans.transaction_id) &&
        !existingTransactions.some(
          (i) => i.transaction_id === trans.transaction_id
        ) &&
        !existingMatchedTransactionIDs.has(trans.transaction_id)
      ) {
        existingTransactions.push(trans);
      }
    });

    return existingTransactions;
  }

  function buildTransactionData(inputJob, temporaryTransactionIDs = []) {
    const transactionData = [];
    const matchedTransactions = new Set(temporaryTransactionIDs);
    inputJob.build.sale.marketOrders.forEach((order) => {
      const itemTransactions = findTransactionsForMarketOrders(
        order,
        matchedTransactions
      );
      itemTransactions.forEach((itemTrans) => {
        matchedTransactions.add(itemTrans.transaction_id);
        const transJournal = findJournalEntry(itemTrans);
        const transTax = findTransactionTax(itemTrans);
        if (!transJournal && !transTax) return;
        const descriptionTrim = transJournal.description
          .replace("Market: ", "")
          .split(" bought");
        transactionData.push({
          ...new Transaction(
            itemTrans,
            descriptionTrim[0],
            transJournal,
            transTax,
            order.CharacterHash
          ),
        });
      });
    });
    return transactionData;
  }

  function findBrokersFeeEntry(order, brokersFee) {
    const checkEntry = (entry) => {
      if (
        entry?.ref_type === "brokers_fee" ||
        Date.parse(order?.issued) === Date.parse(entry?.date)
      ) {
        return { ...new ESIBrokerFee(entry, order, brokersFee) };
      }
      return null;
    };

    const journalEntries = [
      ...esiJournal.flatMap((entry) => entry?.data ?? []),
      ...corpEsiJournal.flatMap((user) =>
        user?.data.flatMap(({ data }) => data ?? [])
      ),
    ];

    for (const entry of journalEntries) {
      const brokerFee = checkEntry(entry);
      if (brokerFee !== null) {
        return brokerFee;
      }
    }

    return null;
  }

  return {
    buildTransactionData,
    findBrokersFeeEntry,
    findMarketOrdersForItem,
    findTransactionsForMarketOrders,
    findJournalEntry,
    findTransactionTax,
  };
}
