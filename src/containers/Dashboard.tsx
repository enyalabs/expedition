import { Grid, Typography } from "@material-ui/core";
import useEthRPCStore from "../stores/useEthRPCStore";
import * as React from "react";
import { weiToGwei } from "../components/formatters";
import LoadingView from "../components/LoadingView/LoadingView";
import getBlocks, { useBlockNumber } from "../helpers";
import useInterval from "use-interval";
import ChartCard from "../components/ChartCard";
import BlockListContainer from "./BlockList";
import { hexToNumber } from "@etclabscore/eserialize";
import { useTranslation } from "react-i18next";
import { Block as IBlock, IsSyncingResult as ISyncing} from "@etclabscore/ethereum-json-rpc";
import * as ethers from "ethers";

const useState = React.useState;

const config = {
  blockTime: 15, // seconds
  blockHistoryLength: 100,
  chartHeight: 200,
  chartWidth: 400,
};

export default (props: any) => {
  const [erpc] = useEthRPCStore();
  const [blockNumber] = useBlockNumber(erpc);
  const [chainId, setChainId] = useState<string>();
  // eslint-disable-next-line
  const [block, setBlock] = useState<IBlock>();
  const [blocks, setBlocks] = useState<IBlock[]>();
  const [gasPrice, setGasPrice] = useState<string>();
  const [syncing, setSyncing] = useState<ISyncing>();
  const [peerCount, setPeerCount] = useState<string>();
  const [rollupL1GasFee, setRollupL1GasFee] = useState<string>();
  const [rollupL2GasFee, setRollupL2GasFee] = useState<string>();

  const { t } = useTranslation();
  const URL = window.location.href.includes("Mainnet") ? 
    process.env.REACT_APP_NETWORK_1 : 
    process.env.REACT_APP_NETWORK_2;
  const L2Web3 = new ethers.providers.JsonRpcProvider(URL);

  React.useEffect(() => {
    if (!erpc) { return; }
    erpc.eth_chainId().then((cid) => {
      if (cid === null) { return; }
      setChainId(cid);
    });
    L2Web3.send('rollup_gasPrices', []).then(rollupGasPrice => {
      if (rollupGasPrice === null) { return; }
      setRollupL1GasFee(ethers.BigNumber.from(rollupGasPrice.l1GasPrice).toString())
      setRollupL2GasFee(ethers.BigNumber.from(rollupGasPrice.l2GasPrice).toString())
    })
  }, [erpc, L2Web3]);

  React.useEffect(() => {
    if (!erpc || blockNumber === undefined) { return; }
    erpc.eth_getBlockByNumber(`0x${blockNumber.toString(16)}`, true).then((b) => {
      if (b === null) { return; }
      setBlock(b);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockNumber]);

  React.useEffect(() => {
    if (!erpc || blockNumber === null) { return; }
    getBlocks(
      Math.max(blockNumber - config.blockHistoryLength + 1, 0),
      blockNumber,
      erpc,
    ).then((bl) => {
      setBlocks(bl);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockNumber]);

  useInterval(() => {
    if (!erpc) { return; }
    erpc.eth_syncing().then(setSyncing);
  }, 10000, true);

  React.useEffect(() => {
    if (!erpc) { return; }
    erpc.net_peerCount().then(setPeerCount);
  }, [erpc]);

  React.useEffect(() => {
    if (!erpc) { return; }
    erpc.eth_gasPrice().then(setGasPrice);
  }, [erpc]);

  useInterval(() => {
    if (!erpc) { return; }
    L2Web3.send('rollup_gasPrices', []).then(rollupGasPrice => {
      if (rollupGasPrice === null) { return; }
      setRollupL1GasFee(ethers.BigNumber.from(rollupGasPrice.l1GasPrice).toString())
      setRollupL2GasFee(ethers.BigNumber.from(rollupGasPrice.l2GasPrice).toString())
    })
  }, 60000, true);

  if (blocks === undefined || chainId === undefined || gasPrice === undefined || peerCount === undefined) {
    return <LoadingView />;

  }
  return (
    <div>
      <Grid container spacing={3} direction="column">
        <Grid item container justify="space-between">
          <Grid item key="blockHeight">
            <ChartCard title={t("Block Height")}>
              <Typography variant="h4">{blockNumber}</Typography>
            </ChartCard>
          </Grid>
          <Grid key="chainId" item>
            <ChartCard title={t("Chain ID")}>
              <Typography variant="h4">{hexToNumber(chainId)}</Typography>
            </ChartCard>
          </Grid>
          {syncing &&
            <div key="syncing">
              <ChartCard title={t("Syncing")}>
                {typeof syncing === "object" && syncing.currentBlock &&
                  <Typography variant="h4">
                    {hexToNumber(syncing.currentBlock)} / {hexToNumber(syncing.highestBlock || "0x0")}
                  </Typography>
                }
              </ChartCard>
            </div>
          }
          <Grid key="gasPrice" item>
            <ChartCard title={t("Gas Price")}>
              <Typography variant="h4">{weiToGwei(hexToNumber(gasPrice))} Gwei</Typography>
            </ChartCard>
          </Grid>
          <Grid key="rollupL1GasPrice" item>
            <ChartCard title={"Rollup L1 Gas Price"}>
             <Typography variant="h4">{weiToGwei(rollupL1GasFee)} Gwei</Typography>
            </ChartCard>
          </Grid>
          <Grid key="rollupL2GasPrice" item>
            <ChartCard title={"Rollup L2 Gas Price"}>
             <Typography variant="h4">{weiToGwei(rollupL2GasFee)} Gwei</Typography>
            </ChartCard>
          </Grid>
        </Grid>
      </Grid>
      <Grid container justify="flex-end">
        {/* <Button
          color="primary"
          variant="outlined"
          endIcon={<ArrowForwardIos />}
          onClick={() => props.history.push("/stats/miners")}
        >More Stats</Button> */}
      </Grid>
      <br />

      <BlockListContainer
        from={Math.max(blockNumber - 14, 0)}
        to={blockNumber}
        disablePrev={true}
        disableNext={blockNumber < 14}
        onNext={() => {
          props.history.push(`/blocks/${blockNumber - 15}`);
        }}
      />
    </div >
  );
};
