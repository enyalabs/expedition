import * as React from "react";
import useEthRPCStore from "../stores/useEthRPCStore";
import TxRaw from "../components/TxRaw/TxRaw";
import LoadingView from "../components/LoadingView/LoadingView";
import {
  Transaction as ITransaction,
  TransactionReceiptOrNull as ITransactionReceipt,
} from "@etclabscore/ethereum-json-rpc";

export default function TransactionRawContainer(props: any) {
  const hash = props.match.params.hash;
  const [erpc] = useEthRPCStore();
  const [transaction, setTransaction] = React.useState<ITransaction>();
  const [receipt, setReceipt] = React.useState<ITransactionReceipt>();

  React.useEffect(() => {
    if (!erpc) { return; }
    erpc.eth_getTransactionByHash(hash).then((tx) => {
      if (tx === null) { return; }
      setTransaction(tx);
    });
  }, [hash, erpc]);

  React.useEffect(() => {
    if (!erpc) { return; }
    erpc.eth_getTransactionReceipt(hash).then((r) => {
      if (r === null) { return; }
      setReceipt(r);
    });
  }, [hash, erpc]);

  if (!transaction || !receipt) {
    return (<LoadingView />);
  }

  return (<TxRaw tx={transaction} receipt={receipt} />);
}
