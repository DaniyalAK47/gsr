// tslint:disable:no-console
import { contract, ContractDesc } from "blockchain/web3ContextNetwork";
import {
  Web3Context,
  Web3ContextConnected,
  Web3ContextConnectedReadonly,
} from "blockchain/web3ContextTypes";
import BigNumber from "bignumber.js";
import {
  bindNodeCallback,
  combineLatest,
  concat,
  interval,
  Observable,
} from "rxjs";
import {
  catchError,
  distinctUntilChanged,
  filter,
  first,
  map,
  shareReplay,
  skip,
  startWith,
  switchMap,
} from "rxjs/operators";
import Web3 from "web3";

import { NetworkConfig, networksById } from "./config";

export const every1Seconds$ = interval(1000).pipe(startWith(0));
export const every3Seconds$ = interval(3000).pipe(startWith(0));
export const every5Seconds$ = interval(5000).pipe(startWith(0));
export const every10Seconds$ = interval(10000).pipe(startWith(0));

interface WithContractMethod {
  contract: <T>(desc: ContractDesc) => T;
}

interface WithWeb3ProviderGetPastLogs {
  web3ProviderGetPastLogs: Web3;
}

export type ContextConnectedReadOnly = NetworkConfig &
  Web3ContextConnectedReadonly &
  WithContractMethod &
  WithWeb3ProviderGetPastLogs;

export type ContextConnected = NetworkConfig &
  Web3ContextConnected &
  WithContractMethod &
  WithWeb3ProviderGetPastLogs;

export type Context = ContextConnected | ContextConnectedReadOnly;

export function createContext$(
  web3ContextConnected$: Observable<
    Web3ContextConnected | Web3ContextConnectedReadonly
  >
): Observable<Context> {
  return web3ContextConnected$.pipe(
    map((web3Context) => {
      // magic link has limit for querying block range and we can't get events in one call
      // couldn't get information from them about what block range they allow
      const networkData = networksById[web3Context.chainId];
      console.log(networkData, "networkData");
      console.log(web3Context, "web3context createContext");

      const web3ProviderGetPastLogs =
        web3Context.connectionKind === "magicLink" ||
        web3Context.connectionKind === "network"
          ? // ? new Web3(networkData.infuraUrl)
            new Web3(
              // "https://mainnet.infura.io/v3/83d2907df9a1437680466193da30126f"
              networkData.infuraUrl
            )
          : web3Context.web3;

      console.log(web3ProviderGetPastLogs, "web3ProviderGetPastLogs");

      return {
        ...networkData,
        ...web3Context,
        contract: <T>(c: ContractDesc) => contract(web3Context.web3, c) as T,
        web3ProviderGetPastLogs,
      } as Context;
    }),
    shareReplay(1)
  );
}

export function createContextConnected$(
  context$: Observable<Context>
): Observable<ContextConnected> {
  return context$.pipe(
    filter(({ status }) => status === "connected"),
    shareReplay(1)
  );
}

export type EveryBlockFunction$ = <O>(
  o$: Observable<O>,
  compare?: (x: O, y: O) => boolean
) => Observable<O>;

export function compareBigNumber(a1: BigNumber, a2: BigNumber): boolean {
  return a1.comparedTo(a2) === 0;
}

export function createOnEveryBlock$(
  web3Context$: Observable<Web3ContextConnected | Web3ContextConnectedReadonly>
): [Observable<number>, EveryBlockFunction$] {
  const onEveryBlock$ = combineLatest(web3Context$, every5Seconds$).pipe(
    switchMap(([{ web3 }]) => bindNodeCallback(web3.eth.getBlockNumber)()),
    catchError((error, source) => {
      console.log(error);
      return concat(every5Seconds$.pipe(skip(1), first()), source);
    }),
    distinctUntilChanged(),
    shareReplay(1)
  );

  function everyBlock$<O>(
    o$: Observable<O>,
    compare?: (x: O, y: O) => boolean
  ) {
    return onEveryBlock$.pipe(
      switchMap(() => o$),
      distinctUntilChanged(compare)
    );
  }

  return [onEveryBlock$, everyBlock$];
}

export function createWeb3ContextConnected$(
  web3Context$: Observable<Web3Context>
) {
  return web3Context$.pipe(
    filter(
      ({ status }) => status === "connected" || status === "connectedReadonly"
    )
  ) as Observable<Web3ContextConnected | Web3ContextConnectedReadonly>;
}

export function createAccount$(web3Context$: Observable<Web3Context>) {
  return web3Context$.pipe(
    map((status) =>
      status.status === "connected"
        ? status.account
        : status.status === "connectedReadonly"
        ? JSON.parse(sessionStorage.getItem("walletData"))?.publicAddress
        : undefined
    )
  );
}

export function createInitializedAccount$(
  account$: Observable<string | undefined>
) {
  return account$.pipe(
    filter((account: string | undefined) => account !== undefined)
  ) as Observable<string>;
}

export function reload(network: string) {
  if (document.location.href.indexOf("network=") !== -1) {
    document.location.href = document.location.href.replace(
      /network=[a-z]+/i,
      "network=" + network
    );
  } else {
    document.location.href = document.location.href + "?network=" + network;
  }
}

export enum NetworkIds {
  MAINNET = 1,
  GOERLI = 5,
  HARDHAT = 2137,
}

// curl --url https://api.dably.io/rpc \
// -X POST \
// -H "Content-Type: application/json" \
// -d '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x4559A2C8Aa07DEf80F83BDC441dE3eB4e8cfeC42", "latest"],"id":1}'
