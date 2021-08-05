import * as React from "react";
import TxView from "../components/TxView";
import LoadingView from "../components/LoadingView/LoadingView";
import useEthRPCStore from "../stores/useEthRPCStore";
import {
  Transaction as ITransaction,
  TransactionReceiptOrNull as ITransactionReceipt,
} from "@etclabscore/ethereum-json-rpc";
import APIWatcher from "../api/watcher";

interface CrossDomainMessage {
  blockNumber? : any
  crossDomainMessage? : any
  crossDomainMessageFinalize? : any
  crossDomainMessageEstimateFinalizedTime? : any
  fastRelay? : any
  from? : any
  to? : any
  hash? : any
  timestamp? : any
  l1Hash? : any
  l1BlockNumber? : any
  l1BlockHash? : any
  l1From? : any
  l1To? : any
}

export default function TransactionContainer(props: any) {
  const hash = props.match.params.hash;
  const [erpc] = useEthRPCStore();
  const [transaction, setTransaction] = React.useState<ITransaction>();
  const [receipt, setReceipt] = React.useState<ITransactionReceipt>();
  const [crossDomainMessage, setCrossDomainMessage] = React.useState<CrossDomainMessage>({ hash: null });
  const apiWatcher = new APIWatcher();

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

  React.useEffect(() => {
    if (transaction) {
      apiWatcher.getCrossDomainMessage(transaction.hash).then(res => {
        setCrossDomainMessage(res)
      })
    }
  // eslint-disable-next-line 
  }, [receipt, transaction]);

  if (!transaction || !receipt || !crossDomainMessage.hash) {
    return (<LoadingView />);
  }

  return (<TxView tx={transaction} receipt={receipt} crossDomainMessage={crossDomainMessage} />);
}
