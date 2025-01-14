import useEthRPCStore from "../stores/useEthRPCStore";
import * as React from "react";
import BlockRaw from "../components/BlockRaw";
import LoadingView from "../components/LoadingView/LoadingView";
import { Block as IBlock } from "@etclabscore/ethereum-json-rpc";

export default function BlockRawContainer(props: any) {
  const { match: { params: { hash } } } = props;
  const [erpc] = useEthRPCStore();
  const [block, setBlock] = React.useState<IBlock>();
  React.useEffect(() => {
    if (!erpc) { return; }
    erpc.eth_getBlockByHash(hash, true).then((b) => {
      if (b === null) { return; }
      setBlock(b);
    });
  }, [hash, erpc]);
  if (!block) { return (<LoadingView />); }
  return (<BlockRaw block={block} />);
}
