import { redirectResults } from "helpers/ConnectTorus";

export type UIReducer = (prev: any, event: any) => any;

export type ReducersMap = {
  [key: string]: UIReducer;
};

export async function setupTorusContext() {
  return await redirectResults();
}
