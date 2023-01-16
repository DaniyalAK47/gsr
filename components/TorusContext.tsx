import { redirectResults } from "helpers/ConnectTorus";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export type UIReducer = (prev: any, event: any) => any;

export type ReducersMap = {
  [key: string]: UIReducer;
};

export async function setupTorusContext() {
  return await redirectResults();
}

// export type TorusContext = ReturnType<typeof setupTorusContext>;
