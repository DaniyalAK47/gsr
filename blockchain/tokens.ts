import { amountFromWei } from "@oasisdex/utils";
import BigNumber from "bignumber.js";
import { bindNodeCallback, combineLatest, Observable, of } from "rxjs";
import { Context } from "./network";
import { CallObservable } from "./calls/observe";
import { tokenBalance } from "./calls/erc20";
import {
  distinctUntilChanged,
  map,
  shareReplay,
  switchMap,
} from "rxjs/operators";

export function createBalance$(
  updateInterval$: Observable<any>,
  context$: Observable<Context>,
  tokenBalance$: CallObservable<typeof tokenBalance>,
  token: string,
  address: string
) {
  return context$.pipe(
    switchMap(({ web3 }) => {
      if (token === "ETH") {
        return updateInterval$.pipe(
          switchMap(() => bindNodeCallback(web3.eth.getBalance)(address)),
          map((ethBalance: string) => {
            console.log(ethBalance, "ethBalance in");

            return amountFromWei(new BigNumber(ethBalance));
          }),
          distinctUntilChanged((x: BigNumber, y: BigNumber) => x.eq(y)),
          shareReplay(1)
        );
      }
      return tokenBalance$({ token, account: address });
    })
  );
}
