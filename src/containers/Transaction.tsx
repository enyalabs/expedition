import * as React from "react";
import TxView from "../components/TxView";
import LoadingView from "../components/LoadingView/LoadingView";
import TransactionList from "../components/TransactionList/TransactionList";
import useEthRPCStore from "../stores/useEthRPCStore";
import {
  Transaction as ITransaction,
  TransactionReceiptOrNull as ITransactionReceipt,
} from "@etclabscore/ethereum-json-rpc";
import { Grid, IconButton } from "@material-ui/core";
import { ArrowForwardIos, ArrowBackIos } from "@material-ui/icons";
import APIWatcher from "../api/watcher";
import useDarkMode from "use-dark-mode";
import "./css/Transaction.css";

const pageInterval = 20;

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
  const [page, setPage] = React.useState<number>(0);
  const [transactions, setTransactions] = React.useState<ITransactionReceipt>();
  const [disableNext, setDisableNext] = React.useState<boolean>(false);
  const darkMode = useDarkMode();
  const apiWatcher = new APIWatcher();

  React.useEffect(() => {
    if (!erpc) { return; }
    if (!hash) {
      apiWatcher.getTransaction("", page, page + pageInterval).then((tx:any) => {
        if (tx === null) { return; }
        if (tx.length !== pageInterval) { setDisableNext(true); }
        setTransactions(tx);
      })
    } else {
      erpc.eth_getTransactionByHash(hash).then((tx) => {
        if (tx === null) { return; }
        setTransaction(tx);
      });
    }
  }, [hash, page, erpc]);

  React.useEffect(() => {
    if (!erpc) { return; }
    if (!hash) { return; }
    erpc.eth_getTransactionReceipt(hash).then((r) => {
      if (r === null) { return; }
      setReceipt(r);
    });
  }, [hash, erpc]);

  React.useEffect(() => {
    if (!hash) { return; }
    if (transaction) {
      apiWatcher.getCrossDomainMessage(transaction.hash).then(res => {
        setCrossDomainMessage(res)
      })
    }
  // eslint-disable-next-line 
  }, [receipt, transaction]);

  const handlePrevPage = () => {
    setPage(page - 10);
  }

  const handleNextPage = () => {
    setPage(page + 10);
  }

  if (!hash) {
    return (
      <div className={!darkMode.value ? "transaction": "transactionDark"}>
        <div className={!darkMode.value ? "transactionContainer": "transactionContainerDark"}>
          <Grid container justify="flex-end">
            <IconButton onClick={()=>handlePrevPage()} disabled={page === 0}>
              <ArrowBackIos />
            </IconButton>
            <IconButton onClick={()=>handleNextPage()} disabled={disableNext}>
              <ArrowForwardIos />
            </IconButton>
          </Grid>
          <TransactionList txs={transactions}/>
        </div>
      </div>
    );
  }

  if (!transaction || !receipt || !crossDomainMessage.hash) {
    return (<LoadingView />);
  }

  return (
    <div className={!darkMode.value ? "transaction": "transactionDark"}>
      <div className={!darkMode.value ? "transactionContainer": "transactionContainerDark"}>
        <TxView tx={transaction} receipt={receipt} crossDomainMessage={crossDomainMessage} />
      </div>
    </div>
  );
}
