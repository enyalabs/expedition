import LoadingView from "../components/LoadingView/LoadingView";
import useEthRPCStore from "../stores/useEthRPCStore";
import * as React from "react";
import BlockView from "../components/BlockView";
import { Block as IBlock } from "@etclabscore/ethereum-json-rpc";
import useDarkMode from "use-dark-mode";
import "./css/Block.css"

export default function Block(props: any) {
  const { match: { params: { hash } } } = props;
  const [block, setBlock] = React.useState<IBlock>();
  const [erpc] = useEthRPCStore();
  const darkMode = useDarkMode();

  React.useEffect(() => {
    if (erpc === undefined) { return; }
    erpc.eth_getBlockByHash(hash, true).then((b) => {
      if (b === null) { return; }
      setBlock(b);
    });
  }, [hash, erpc]);

  if (!block) { return (<LoadingView />); }
  return (
    <div className={`block ${darkMode.value && "dark"}`}>
      <div className={`blockContainer ${darkMode.value && "dark"}`}>
        <BlockView block={block} />
      </div>
    </div>
  );
}
