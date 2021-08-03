import * as React from "react";
import { ethers } from "ethers";
import TxView from "../components/TxView";
import LoadingView from "../components/LoadingView/LoadingView";
import useEthRPCStore from "../stores/useEthRPCStore";
import {
  Transaction as ITransaction,
  TransactionReceiptOrNull as ITransactionReceipt,
} from "@etclabscore/ethereum-json-rpc";
import APIWatcher from "../api/watcher";

const { Watcher } = require('@eth-optimism/watcher');

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

  const L1Web3 = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_L1_NODE_WEB3_URL);
  const L2Web3 = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_L2_NODE_WEB3_URL);
  const watcher = new Watcher({
    l1: {
      provider: L1Web3,
      messengerAddress: "0xF10EEfC14eB5b7885Ea9F7A631a21c7a82cf5D76",
    },
    l2: {
      provider: L2Web3,
      messengerAddress: "0x4200000000000000000000000000000000000007",
    },
  });

  const watcherFast = new Watcher({
    l1: {
      provider: L1Web3,
      messengerAddress: "0xF296F4ca6A5725F55EdF1C67F80204871E65F87d",
    },
    l2: {
      provider: L2Web3,
      messengerAddress: "0x4200000000000000000000000000000000000007",
    },
  });

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
        if (res.crossDomainMessageFinalize) {
          let activeWatcher: any
          if (res.fastRelay) activeWatcher = watcherFast
          else activeWatcher = watcher
          activeWatcher.getMessageHashesFromL2Tx(transaction.hash).then((l2ToL1msgHash: any[]) => {
            activeWatcher.getL1TransactionReceipt(l2ToL1msgHash[0]).then((l1Receipt: any) => {
              setCrossDomainMessage({ 
                ...res, l1Hash: l1Receipt.transactionHash, 
                l1BlockNumber: l1Receipt.blockNumber,
                l1BlockHash: l1Receipt.blockHash,
                l1From: l1Receipt.from,
                l1To: l1Receipt.to
              })
            })
          })
        } else {
          setCrossDomainMessage(res)
        }
      })
    }
  // eslint-disable-next-line 
  }, [receipt, transaction]);

  if (!transaction || !receipt || !crossDomainMessage.hash) {
    return (<LoadingView />);
  }

  return (<TxView tx={transaction} receipt={receipt} crossDomainMessage={crossDomainMessage} />);
}
