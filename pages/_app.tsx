import "../styles/globals.css";
import { CacheProvider, Global } from "@emotion/core";
import createCache from "@emotion/cache";
import { appWithTranslation } from "next-i18next";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { Web3ReactProvider } from "@web3-react/core";
import { SetupWeb3Context } from "blockchain/web3Context";
import type { AppProps } from "next/app";
import { ThemeProvider } from "theme-ui";
import { theme } from "../theme";
import { globalStyles } from "../helpers";
import { AppContextProvider } from "components/AppContextProvider";
import { ModalProvider } from "helpers/modalHook";
import Web3 from "web3";
import { readOnlyEnhanceProvider } from "blockchain/readOnlyEnhancedProviderProxy";
import { AppLayout, MarketingLayoutProps } from "components/Layouts";
import { SharedUIProvider } from "components/SharedUIProvider";
import nextI18NextConfig from "../next-i18next.config.js";
import { mixpanelInit } from "../analytics/mixpanel";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { trackingEvents } from "analytics/analytics";
import { loadFeatureToggles } from "helpers/useFeatureToggle";

const key = "gsr-cache";
const cache = createCache({ key });

function getLibrary(
  provider: any,
  connector: AbstractConnector | undefined
): Web3 {
  const chainIdPromise = connector!.getChainId();
  const readOnlyEnhancedProvider = readOnlyEnhanceProvider(
    provider,
    chainIdPromise
  );
  return new Web3(readOnlyEnhancedProvider);
}
// extending Component with static properties that can be attached to it
// to control theme, layout and it's props
interface CustomAppProps {
  Component: {
    theme?: string;
    layoutProps?: MarketingLayoutProps;
    layout?: (props: MarketingLayoutProps) => JSX.Element;
    seoTags?: JSX.Element;
  };
}

mixpanelInit();
loadFeatureToggles();

function App({ Component, pageProps }: AppProps & CustomAppProps) {
  const Layout = Component.layout || AppLayout;
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      // track events when not in development
      if (process.env.NODE_ENV !== "development") {
        trackingEvents.pageView(url);
      }
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, []);
  return (
    <ThemeProvider theme={theme}>
      <CacheProvider value={cache}>
        <Web3ReactProvider {...{ getLibrary }}>
          <AppContextProvider>
            <ModalProvider>
              <SetupWeb3Context>
                <SharedUIProvider>
                  <Layout>
                    <Global styles={globalStyles} />
                    <Component {...pageProps} />
                  </Layout>
                </SharedUIProvider>
              </SetupWeb3Context>
            </ModalProvider>
          </AppContextProvider>
        </Web3ReactProvider>
      </CacheProvider>
    </ThemeProvider>
  );
}
export default appWithTranslation(
  App as React.ComponentType<AppProps> | React.ElementType<AppProps>,
  nextI18NextConfig as any
);
