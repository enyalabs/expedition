import { Grid, IconButton } from "@material-ui/core";
import useEthRPCStore from "../stores/useEthRPCStore";
import * as React from "react";
import BlockList from "../components/BlockList";
import LoadingView from "../components/LoadingView/LoadingView";
import getBlocks from "../helpers";
import { ArrowForwardIos, ArrowBackIos } from "@material-ui/icons";
import { Block as IBlock } from "@etclabscore/ethereum-json-rpc";
import useDarkMode from "use-dark-mode";
import "./css/BlockList.css";

interface IProps {
  from: number;
  to: number;
  disablePrev: boolean;
  disableNext: boolean;
  style?: any;
  onNext?: any;
  onPrev?: any;
}

export default function BlockListContainer(props: IProps) {
  const { from, to, style } = props;
  const [erpc] = useEthRPCStore();
  const [blocks, setBlocks] = React.useState<IBlock[]>();
  const darkMode = useDarkMode();

  React.useEffect(() => {
    if (!erpc) { return; }
    getBlocks(from, to, erpc).then((data) => {
      setBlocks(data);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  if (!blocks) {
    return <LoadingView />;
  }

  return (
    <div className={`blockList ${darkMode.value && "dark"}`}>
      <div className={`blockListContainer ${darkMode.value && "dark"}`} style={style}>
        <Grid container justify="flex-end">
          <IconButton onClick={props.onPrev} disabled={props.disablePrev}>
            <ArrowBackIos />
          </IconButton>
          <IconButton onClick={props.onNext} disabled={props.disableNext}>
            <ArrowForwardIos />
          </IconButton>
        </Grid>
        <BlockList blocks={blocks}/>
      </div>
    </div>
  );
}
