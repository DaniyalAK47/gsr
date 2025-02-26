import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { RedirectResult } from "@toruslabs/customauth";
import { WithChildren } from "../helpers/types";
import { AppContext, setupAppContext } from "./AppContext";
import { setupTorusContext } from "./TorusContext";
import { useFeatureToggle } from "helpers/useFeatureToggle";
import {
  SwitchNetworkModal,
  SwitchNetworkModalType,
} from "./SwitchNetworkModal";
import { useModal } from "helpers/modalHook";

export const appContext =
  React.createContext<AppContext | undefined>(undefined);

export const torusContext =
  React.createContext<(RedirectResult & { setState: any }) | undefined>(
    undefined
  );

export function isAppContextAvailable(): boolean {
  return !!useContext(appContext);
}

export function useAppContext(): AppContext {
  const ac = useContext(appContext);
  if (!ac) {
    throw new Error(
      "AppContext not available! useAppContext can't be used serverside"
    );
  }
  return ac;
}

export function useTorusContext():
  | (RedirectResult & { setState: any })
  | undefined {
  const ac = useContext(torusContext);
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
  const torusToggle = useFeatureToggle("Torus");
  const openModal = useModal();
  const switchNetworkModal = (type: SwitchNetworkModalType) =>
    openModal(SwitchNetworkModal, { type });

  useEffect(() => {
    setContext(setupAppContext());
  }, []);

  useEffect(() => {
    const getData = async () => {
      if (torusToggle && router.pathname == "/signedIn") {
        setContextTorus(
          await setupTorusContext({
            switchNetworkModal,
          })
        );
      }
    };
    getData();
  }, [router.pathname]);

  return (
    <>
      <torusContext.Provider
        value={{ ...contextTorus, setState: setContextTorus }}
      >
        <appContext.Provider value={context}>{children}</appContext.Provider>
      </torusContext.Provider>
    </>
  );
}
