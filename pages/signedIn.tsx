import { getNetworkId } from "blockchain/web3ContextNetwork";
import { useAppContext } from "components/AppContextProvider";
import { connect } from "components/connectWallet/ConnectWallet";
import { formatCryptoBalance } from "helpers/formatters/format";
import { useObservable } from "helpers/observableHook";
import { useFeatureToggle } from "helpers/useFeatureToggle";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, { useEffect } from "react";

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});

function SignedInPage() {
  const { web3Context$, accountData$ } = useAppContext();
  const [web3Context] = useObservable(web3Context$);
  const [accountData] = useObservable(accountData$);
  const torusToggle = useFeatureToggle("Torus");

  useEffect(() => {
    async function getData() {
      const networkId = getNetworkId();

      connect(web3Context, "network", networkId)();
    }
    if (
      torusToggle &&
      web3Context?.status !== "connectedReadonly" &&
      web3Context?.status !== "connected"
    )
      getData();
  }, [web3Context?.status]);

  return (
    <div>
      <p>You have logged in. </p>
      <p>
        {accountData?.ethBalance &&
          formatCryptoBalance(accountData?.ethBalance)}
      </p>
    </div>
  );
}

export default SignedInPage;
