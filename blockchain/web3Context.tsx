import {
  isAppContextAvailable,
  useAppContext,
} from "components/AppContextProvider";
import { WithChildren } from "helpers/types";
import React from "react";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { useWeb3React } from "@web3-react/core";
import { NetworkConnector } from "@web3-react/network-connector";
import { Provider as Web3Provider } from "ethereum-types";
import { isEqual } from "lodash";
import { useEffect, useState } from "react";
import { Observable, ReplaySubject } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";
import { LedgerConnector } from "@oasisdex/connectors";
import { ContractDesc, getNetworkId } from "./web3ContextNetwork";
import { ConnectionKind, Web3Context } from "./web3ContextTypes";

function SetupWeb3ContextInternal({ children }: WithChildren) {
  const { setupWeb3Context$ } = useAppContext();
  setupWeb3Context$();
  return children;
}

export function SetupWeb3Context({ children }: WithChildren) {
  if (isAppContextAvailable()) {
    return <SetupWeb3ContextInternal>{children}</SetupWeb3ContextInternal>;
  }
  return children;
}

export function createWeb3Context$(
  chainIdToRpcUrl: { [chainId: number]: string },
  chainIdToDaiContractDesc: { [chainId: number]: ContractDesc }
): [Observable<Web3Context>, () => void] {
  const web3Context$ = new ReplaySubject<Web3Context>(1);
  // const web3Context$ = new ReplaySubject<Web3Context>(
  //   "https://api.dably.io/rpc"
  // );

  function push(c: Web3Context) {
    web3Context$.next(c);
  }

  function setupWeb3Context$() {
    const context = useWeb3React<Web3Provider>();

    const {
      connector,
      library,
      chainId,
      account,
      activate,
      deactivate,
      active,
      error,
    } = context;
    console.log(context, "context");

    const [activatingConnector, setActivatingConnector] =
      useState<AbstractConnector>();
    const [connectionKind, setConnectionKind] = useState<ConnectionKind>();
    const [hwAccount, setHWAccount] = useState<string>();

    async function connect(
      connector: AbstractConnector,
      connectionKind: ConnectionKind
    ) {
      setActivatingConnector(connector);
      setConnectionKind(connectionKind);
      setHWAccount(undefined);
      await activate(connector);
    }

    async function connectLedger(chainId: number, baseDerivationPath: string) {
      const connector = new LedgerConnector({
        baseDerivationPath,
        chainId,
        url: chainIdToRpcUrl[chainId],
        pollingInterval: 1000,
      });
      await connect(connector, "ledger");
    }

    useEffect(() => {
      if (activatingConnector && activatingConnector === connector) {
        setActivatingConnector(undefined);
      }
    }, [activatingConnector, connector]);

    useEffect(() => {
      if (activatingConnector) {
        push({
          status: "connecting",
          connectionKind: connectionKind!,
        });
        return;
      }

      if (error) {
        console.log(error);
        push({
          status: "error",
          error,
          connect,
          connectLedger,
          deactivate,
        });
        return;
      }

      if (!connector) {
        push({
          status: "notConnected",
          connect,
          connectLedger,
        });
        return;
      }

      if (!account) {
        push({
          status: "connectedReadonly",
          connectionKind: connectionKind!,
          web3: library as any,
          chainId: chainId!,
          connect,
          connectLedger,
          deactivate,
        });
        return;
      }

      if (
        (connectionKind === "ledger" || connectionKind === "trezor") &&
        !hwAccount
      ) {
        push({
          status: "connectingHWSelectAccount",
          connectionKind,
          getAccounts: async (accountsLength: number) =>
            await fetchAccountBalances(
              accountsLength,
              connector as LedgerConnector,
              chainIdToDaiContractDesc[chainId!]
            ),
          selectAccount: (account: string) => {
            setHWAccount(account);
          },
          deactivate,
        });
        return;
      }

      if (chainId !== getNetworkId()) {
        setTimeout(() => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          connect(
            new NetworkConnector({
              urls: chainIdToRpcUrl,
              defaultChainId: getNetworkId(),
            }),
            "network"
          );
        });
        return;
      }

      if (connectionKind) {
        push({
          status: "connected",
          connectionKind,
          web3: library as any,
          chainId: chainId!,
          account:
            ["ledger", "trezor"].indexOf(connectionKind) >= 0
              ? hwAccount!
              : account,
          deactivate,
          magicLinkEmail: undefined,
          // REFACTOR!
          // connectionKind === 'magicLink'
          //   ? (connector as MagicLinkConnector).getEmail()
          //   : undefined,
        });
      }
    }, [
      activatingConnector,
      connectionKind,
      connector,
      library,
      chainId,
      account,
      activate,
      deactivate,
      active,
      error,
      hwAccount,
    ]);
  }

  return [web3Context$.pipe(distinctUntilChanged(isEqual)), setupWeb3Context$];
}
