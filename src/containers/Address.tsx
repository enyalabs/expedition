import * as React from "react";
import AddressView from "../components/AddressView";
import LoadingView from "../components/LoadingView/LoadingView";
import { useBlockNumber } from "../helpers";
import useEthRPCStore from "../stores/useEthRPCStore";
import { hexToNumber } from "@etclabscore/eserialize";
import AddressTransactions from "../components/AddressTransactions";
import { History } from "history";
import { Transaction } from "@etclabscore/ethereum-json-rpc";
import Watcher from "../api/watcher";

const unit = require("ethjs-unit"); //tslint:disable-line

interface IProps {
  match: {
    params: {
      address: string,
      from: number,
      block: string,
    };
  };
  history: History;
}

const Address: React.FC<IProps> = ({ match, history }) => {
  const { address, from, block } = match.params;
  const [erpc] = useEthRPCStore();
  const [blockNumber] = useBlockNumber(erpc);
  const [transactionCount, setTransactionCount] = React.useState<string>();
  const [balance, setBalance] = React.useState<string>();
  const [code, setCode] = React.useState<string>();
  const blockNum = block === undefined ? blockNumber : parseInt(block, 10);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);

  const watcher = new Watcher();
  const fromRange = from ? from : 0;
  const toRange = fromRange + 10;

  React.useEffect(() => {
    if (isNaN(blockNum) || isNaN(blockNumber)) {
      return;
    }
    if (blockNum > blockNumber) {
      history.push(`/address/${address}/${blockNumber}`);
    }
    if (blockNum < 0) {
      history.push(`/address/${address}/0`);
    }
  }, [blockNumber, blockNum, history, address]);

  React.useEffect(() => {
    if (blockNumber === undefined || !erpc || isNaN(blockNumber)) {
      return;
    }
    const hexBlockNumber = `0x${blockNumber.toString(16)}`;
    erpc.eth_getTransactionCount(address, hexBlockNumber).then((txCount) => {
      if (txCount === null) { return; }
      setTransactionCount(txCount);
      return txCount;
    }).then((txCountRes: string | undefined) => {
      if (txCountRes) {
        erpc.eth_getBalance(address, hexBlockNumber).then((b) => {
          if (b === null) { return; }
          setBalance(b);
        });
        erpc.eth_getCode(address, hexBlockNumber).then((c) => {
          if (c === null) { return; }
          setCode(c);
        });
      }
    });
  }, [blockNumber, address, erpc]);

  React.useEffect(() => {
    watcher.getTransaction(address, fromRange, toRange).then(transactions => {
      setTransactions(transactions);
    })
  // eslint-disable-next-line 
  }, [fromRange, toRange]);

  if (transactionCount === undefined || balance === undefined || code === undefined) {
    return <LoadingView />;
  }

  return (
    <>
      <AddressView
        address={address}
        txCount={transactionCount ? hexToNumber(transactionCount) : 0}
        balance={unit.fromWei(balance || 0, "ether")}
        code={code}
      />
      <AddressTransactions
        from={fromRange}
        to={toRange}
        transactions={transactions}
        disablePrev={fromRange === 0}
        disableNext={transactions.length < 10}
        onPrev={() => {
          const newQuery = Math.max(fromRange - 10, 0);
          history.push(`/address/${address}/${newQuery}`);
        }}
        onNext={() => {
          const newQuery = fromRange + 10;
          history.push(`/address/${address}/${newQuery}`);
        }}
      />
    </>
  );
};

export default Address;
