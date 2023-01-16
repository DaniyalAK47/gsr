import { getNetworkId } from "blockchain/web3ContextNetwork";
import { useAppContext } from "components/AppContextProvider";
import { connect } from "components/connectWallet/ConnectWallet";
import { useObservable } from "helpers/observableHook";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, { useEffect, useMemo } from "react";

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});

function SignedInPage() {
  const { web3Context$ } = useAppContext();
  const [web3Context] = useObservable(web3Context$);
  // const [web3Context] = useMemo(
  //   () => useObservable(web3Context$),
  //   [web3Context$]
  // );
  const shouldSetStateToLoading =
    web3Context?.status === "connectedReadonly" ? false : true;

  useEffect(() => {
    console.log("inside signedIn useEffect");

    async function getData() {
      console.log("inside signedIn getData");

      const networkId = getNetworkId();

      console.log(networkId, web3Context, "web3Context in signIn");

      connect(web3Context, "network", networkId)();
      // console.log(res, "res after connect");
    }
    getData();
  }, [web3Context]);

  return (
    <div>
      <p>You have logged in. </p>
    </div>
  );
}

export default SignedInPage;
