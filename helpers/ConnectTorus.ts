import TorusSdk, {
  LOGIN,
  UX_MODE,
  RedirectResult,
} from "@toruslabs/customauth";
import getConfig from "next/config";

let torusSdk: TorusSdk;

export async function connect(options: Record<string, any> = {}) {
  try {
    torusSdk = new TorusSdk({
      baseUrl: window.location.origin,
      redirectPathName: "signedIn",
      enableLogging: true,
      uxMode: UX_MODE.REDIRECT,
      network: "mainnet",
    });

    await torusSdk.init({ skipSw: true });

    let verifier = {
      typeOfLogin: LOGIN.JWT,
      verifier: getConfig().publicRuntimeConfig.torusVerifier,
      clientId: getConfig().publicRuntimeConfig.authClientId,
      jwtParams: {
        connection: "",
        verifierIdField: "name",
        isVerifierIdCaseSensitive: false,
        domain: getConfig().publicRuntimeConfig.authDomain,
        languageDictionary: JSON.stringify({
          title: "Welcome to DAB:LY",
          emailInputPlaceholder: "something@youremail.com",
        }),
      },
    };
    await torusSdk.triggerLogin(verifier);
  } catch (err) {
    options.switchNetworkModal("walletIssue");
    console.log(err, "err on torus");
  }
}

export async function redirectResults() {
  try {
    torusSdk = new TorusSdk({
      baseUrl: window.location.origin,
      redirectPathName: "signedIn",
      enableLogging: true,
      uxMode: UX_MODE.REDIRECT,
      network: "mainnet",
    });

    await torusSdk.init({ skipSw: true });
    console.log(torusSdk, "torusSdk redirectResults");

    let torusResult = await torusSdk?.getRedirectResult();
    console.log(torusResult, "torusResult");

    return torusResult;
  } catch (error) {
    console.log("error", error);
  }
}
