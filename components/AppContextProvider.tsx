import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { RedirectResult } from "@toruslabs/customauth";
import { WithChildren } from "../helpers/types";
import { AppContext, setupAppContext } from "./AppContext";
import { setupTorusContext } from "./TorusContext";
import { useObservable } from "helpers/observableHook";
import { getNetworkId } from "blockchain/web3ContextNetwork";
import { connect } from "./connectWallet/ConnectWallet";

export const appContext =
  React.createContext<AppContext | undefined>(undefined);

export const torusContext =
  React.createContext<RedirectResult | undefined>(undefined);

export function isAppContextAvailable(): boolean {
  return !!useContext(appContext);
}

export function useAppContext(): AppContext {
  const ac = useContext(appContext);
  // console.log("ac", ac);
  if (!ac) {
    throw new Error(
      "AppContext not available! useAppContext can't be used serverside"
    );
  }
  return ac;
}

export function useTorusContext(): RedirectResult | undefined {
  const ac = useContext(torusContext);
  // console.log("ac", ac);
  // if (!ac) {
  //   throw new Error(
  //     "AppContext not available! useAppContext can't be used serverside"
  //   );
  // }
  return ac;
}

/*
  This component is providing streams of data used for rendering whole app (AppContext).
  It depends on web3 - which for now is only provided by Client side.
  To block rendering of given page eg. '/trade' setup conditional rendering
  on top of that page with isAppContextAvailable.
*/

export function AppContextProvider({ children }: WithChildren) {
  const [context, setContext] = useState<AppContext | undefined>(undefined);
  const [contextTorus, setContextTorus] =
    useState<RedirectResult | undefined>(undefined);
  const router = useRouter();
  // if (context) {
  //   const { web3Context$ } = useAppContext();
  // }

  useEffect(() => {
    setContext(setupAppContext());
  }, []);

  // const { web3Context$ } = useAppContext();

  useEffect(() => {
    const getData = async () => {
      if (router.pathname == "/signedIn") {
        // const networkId = getNetworkId();
        // if (context) {
        //   var [web3Context] = useObservable(context?.web3Context$);
        // }

        // console.log(web3Context, "web3Context in getData");

        setContextTorus(await setupTorusContext());

        // connect(web3Context, "network", networkId);
      }
    };
    getData();
  }, [router.pathname]);

  return (
    console.log(torusContext, "torus context", context, "context"),
    (
      <>
        <torusContext.Provider value={contextTorus}>
          <appContext.Provider value={context}>{children}</appContext.Provider>
        </torusContext.Provider>
      </>
    )
  );
}
