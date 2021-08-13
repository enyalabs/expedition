// import { useEffect } from "react";
// import { uniqBy } from "lodash";
import { IChain as Chain } from "../models/chain";
import React from "react";
require('dotenv').config();

declare var process : {
  env: {
    REACT_APP_NETWORK_1: string
    REACT_APP_NETWORK_2: string
  }
}

export default function() {
  const [chains, setChains] = React.useState<Chain[]>([
    {
      name: "Mainnet",
      network: "OMGX Mainnet",
      rpc: [process.env.REACT_APP_NETWORK_1],
    },
    {
      name: "Rinkeby",
      network: "OMGX Rinkeby",
      rpc: [process.env.REACT_APP_NETWORK_2],
    }
  ]);
  return [chains, setChains];
}
