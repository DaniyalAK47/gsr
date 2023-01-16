import { ConnectWallet } from "components/connectWallet/ConnectWallet";
import { useFeatureToggle } from "helpers/useFeatureToggle";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React from "react";

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});

function ConnectPage() {
  return <ConnectWallet />;
}

export default ConnectPage;
