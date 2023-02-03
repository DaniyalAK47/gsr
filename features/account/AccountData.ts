import { Web3Context } from "@oasisdex/web3-context";
import BigNumber from "bignumber.js";
import { ContextConnected } from "blockchain/network";
// import { Vault } from 'blockchain/vaults'
// import { PositionCreated } from 'features/aave/services/readPositionCreatedEvents'
import { startWithDefault } from "helpers/operators";
import { combineLatest, Observable } from "rxjs";
import { filter, map, shareReplay, switchMap } from "rxjs/operators";

export interface AccountDetails {
  numberOfVaults: number | undefined;
  ethBalance: BigNumber | undefined;
  ensName: string | null;
}
export function createAccountData(
  context$: Observable<Web3Context>,
  balance$: (token: string, address: string) => Observable<BigNumber>
  // vaults$: (address: string) => Observable<Vault[]>,
  // hasActiveDsProxyAavePosition$: Observable<boolean>,
  // readPositionCreatedEvents$: (wallet: string) => Observable<PositionCreated[]>,
  //   ensName$: (address: string) => Observable<string>
): Observable<AccountDetails> {
  return context$.pipe(
    filter(
      (context): context is ContextConnected =>
        context.status === "connected" || context.status === "connectedReadonly"
    ),
    switchMap((context) =>
      combineLatest(
        startWithDefault(
          balance$(
            "ETH",
            context.account
              ? context?.account
              : // "0x4559A2C8Aa07DEf80F83BDC441dE3eB4e8cfeC42"
                JSON.parse(sessionStorage.getItem("walletData"))?.publicAddress
          ),
          undefined
        )
        //   startWithDefault(vaults$(context.account).pipe(map((vault) => vault.length)), undefined),
        //   startWithDefault(ensName$(context.account), null),
        //   startWithDefault(hasActiveDsProxyAavePosition$, false),
        //   startWithDefault(readPositionCreatedEvents$(context.account), []),
      ).pipe(
        map(([balance]) => {
          console.log(balance, "balance get");

          // const numberOfDpmVaults = dpmPositionCreatedEvents.length
          //   ? dpmPositionCreatedEvents.length
          //   : 0
          // const numberOfAavePositions = hasAavePosition ? 1 : 0

          return {
            //   numberOfVaults: (numberOfVaults || 0) + numberOfDpmVaults + numberOfAavePositions,
            ethBalance: balance,
            //   ensName,
          };
        })
      )
    ),
    shareReplay(1)
  );
}
