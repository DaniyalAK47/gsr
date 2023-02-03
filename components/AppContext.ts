import { createWeb3Context$ } from "blockchain/web3Context";
// import { trackingEvents } from "analytics/analytics";
// import { mixpanelIdentify } from "analytics/mixpanel";
import { redirectState$ } from "features/router/redirectState";
import { curry, isEqual, mapValues, memoize } from "lodash";
import { combineLatest, of } from "rxjs";
import { distinctUntilChanged, mergeMap } from "rxjs/operators";
import {
  createAccount$,
  createContext$,
  createContextConnected$,
  createInitializedAccount$,
  createOnEveryBlock$,
  createWeb3ContextConnected$,
} from "../blockchain/network";
import { networksById } from "blockchain/config";
import { observe } from "blockchain/calls/observe";
import { tokenBalance } from "blockchain/calls/erc20";
import { shareReplay } from "rxjs/operators";
import { createBalance$ } from "blockchain/tokens";
import { createAccountData } from "features/account/AccountData";

export type UIReducer = (prev: any, event: any) => any;

export type ReducersMap = {
  [key: string]: UIReducer;
};

export function setupAppContext() {
  const chainIdToRpcUrl = mapValues(
    networksById,
    (network) => network.infuraUrl
  );
  const chainIdToDAIContractDesc = mapValues(
    networksById,
    (network) => network.tokens.DAI
  );
  const [web3Context$, setupWeb3Context$] = createWeb3Context$(
    chainIdToRpcUrl,
    chainIdToDAIContractDesc
  );

  const account$ = createAccount$(web3Context$);
  const initializedAccount$ = createInitializedAccount$(account$);

  const web3ContextConnected$ = createWeb3ContextConnected$(web3Context$);

  const [onEveryBlock$] = createOnEveryBlock$(web3ContextConnected$);

  const context$ = createContext$(web3ContextConnected$);

  const chainContext$ = context$.pipe(
    distinctUntilChanged(
      (previousContext, newContext) =>
        previousContext.chainId === newContext.chainId
    ),
    shareReplay(1)
  );

  const connectedContext$ = createContextConnected$(context$);

  combineLatest(account$, connectedContext$)
    .pipe(
      mergeMap(([account, network]) => {
        return of({
          networkName: network.name,
          connectionKind: network.connectionKind,
          account: account?.toLowerCase(),
        });
      }),
      distinctUntilChanged(isEqual)
    )
    .subscribe(({ account, networkName, connectionKind }) => {
      if (account) {
        // mixpanelIdentify(account, { walletType: connectionKind });
        // trackingEvents.accountChange(account, networkName, connectionKind)
      }
    });

  const tokenBalance$ = observe(onEveryBlock$, context$, tokenBalance);

  const balance$ = memoize(
    curry(createBalance$)(onEveryBlock$, chainContext$, tokenBalance$),
    (token, address) => `${token}_${address}`
  );

  const accountData$ = createAccountData(
    web3Context$,
    balance$
    // vaults$,
    // hasActiveDsProxyAavePosition$,
    // readPositionCreatedEvents$,
    // ensName$,
  );

  return {
    web3Context$,
    web3ContextConnected$,
    setupWeb3Context$,
    initializedAccount$,
    context$,
    onEveryBlock$,
    redirectState$,
    connectedContext$,
    accountData$,
  };
}

export type AppContext = ReturnType<typeof setupAppContext>;
