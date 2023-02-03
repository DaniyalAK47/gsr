import { redirectResults } from "helpers/ConnectTorus";

export type UIReducer = (prev: any, event: any) => any;

export type ReducersMap = {
  [key: string]: UIReducer;
};

export async function setupTorusContext(options: Record<string, any> = {}) {
  try {
    // return await redirectResults();
    throw new Error("torus not working");
  } catch (error) {
    options.switchNetworkModal("walletIssue");
    console.log("error in redirect result", error);
  }
}
