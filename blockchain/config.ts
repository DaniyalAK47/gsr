import { ContractDesc } from "blockchain/web3ContextNetwork";
import { Abi } from "helpers/types";
import { keyBy } from "lodash";
import getConfig from "next/config";
import { Dictionary } from "ts-essentials";

export function contractDesc(abi: Abi[], address: string): ContractDesc {
  return { abi, address };
}

const infuraProjectId =
  process.env.INFURA_PROJECT_ID ||
  getConfig()?.publicRuntimeConfig?.infuraProjectId ||
  "";
const etherscanAPIKey =
  process.env.ETHERSCAN_API_KEY ||
  getConfig()?.publicRuntimeConfig?.etherscan ||
  "";
const mainnetCacheUrl =
  process.env.MAINNET_CACHE_URL ||
  getConfig()?.publicRuntimeConfig?.mainnetCacheURL ||
  "https://cache-goerli-dev.gsuprotocol.io/api/v1";

export const charterIlks = [];

export const cropJoinIlks = [];

export const supportedIlks = [
  /* export just for test purposes */
  "ETH-A",
  "ETH-B",
  "ETH-C",
  "DAI",
  "WBTC-A",
  "WBTC-B",
  "WBTC-C",
  // 'BAT-A',
  // 'USDC-A',
  // 'USDC-B',
  // 'RENBTC-A',
  // 'ZRX-A',
  // 'KNC-A',
  // 'MANA-A',
  // 'TUSD-A',
  // 'USDT-A',
  // 'PAXUSD-A',
  // 'COMP-A',
  // 'LRC-A',
  // 'LINK-A',
  // 'BAL-A',
  // 'YFI-A',
  // 'GUSD-A',
  // 'UNI-A',
  // 'AAVE-A',
  // 'UNIV2DAIETH-A',
  // 'UNIV2USDCETH-A',
  // 'UNIV2DAIUSDC-A',
  // 'UNIV2WBTCETH-A',
  // 'UNIV2ETHUSDT-A',
  // 'UNIV2LINKETH-A',
  // 'UNIV2UNIETH-A',
  // 'UNIV2WBTCDAI-A',
  // 'UNIV2AAVEETH-A',
  // 'UNIV2DAIUSDT-A',
  // 'GUNIV3DAIUSDC1-A',
  // 'GUNIV3DAIUSDC2-A',
  // 'MATIC-A',
  // 'WSTETH-A',
  // 'WSTETH-B',
  ...charterIlks,
  ...cropJoinIlks,
] as const;

export const ilksNotSupportedOnGoerli = [
  "GUNIV3DAIUSDC1-A",
  "GUNIV3DAIUSDC2-A",
  ...charterIlks,
  ...cropJoinIlks,
] as const;

const tokensMainnet = {} as Dictionary<ContractDesc>;

const protoMain = {
  id: "1",
  // id: "132258",
  name: "main",
  label: "Mainnet",
  infuraUrl: `https://mainnet.infura.io/v3/${infuraProjectId}`,
  // infuraUrl: `https://api.dably.io/rpc`,
  infuraUrlWS: `wss://mainnet.infura.io/ws/v3/${infuraProjectId}`,
  // infuraUrlWS: `wss://api.dably.io/rpc`,

  tokens: tokensMainnet,
  tokensMainnet: tokensMainnet,
  joins: {},

  etherscan: {
    url: "https://etherscan.io",
    apiUrl: "https://api.etherscan.io/api",
    apiKey: etherscanAPIKey || "",
  },
  ethtx: {
    url: "https://ethtx.info/mainnet",
  },
};

export type NetworkConfig = typeof protoMain;

const main: NetworkConfig = protoMain;
const kovan: NetworkConfig = {
  ...protoMain,
  id: "42",
  name: "kovan",
  label: "Kovan",
  infuraUrl: `https://kovan.infura.io/v3/${infuraProjectId}`,
  infuraUrlWS: `wss://kovan.infura.io/ws/v3/${infuraProjectId}`,
};

const goerli: NetworkConfig = {
  id: "5",
  name: "goerli",
  label: "goerli",
  infuraUrl: `https://goerli.infura.io/v3/${infuraProjectId}`,
  infuraUrlWS: `wss://goerli.infura.io/ws/v3/${infuraProjectId}`,
  tokens: {},
  tokensMainnet: protoMain.tokensMainnet,
  joins: {},

  etherscan: {
    url: "https://goerli.etherscan.io",
    apiUrl: "https://api-goerli.etherscan.io/api",
    apiKey: etherscanAPIKey || "",
  },
  ethtx: {
    url: "https://ethtx.info/goerli",
  },
};

const hardhat: NetworkConfig = {
  ...protoMain,
  id: "2137",
  name: "hardhat",
  label: "Hardhat",
  infuraUrl: `https://testchain-dev.gsuprotocol.io/rpc`,
  infuraUrlWS: `wss://testchain-dev.gsuprotocol.io/wss`,
};

export const networksById = keyBy([main, kovan, hardhat, goerli], "id");
export const networksByName = keyBy([main, kovan, hardhat, goerli], "name");

export const dappName = "GSUcoin";
export const pollingInterval = 12000;
