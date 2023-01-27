import { CallDef as CallDefAbstractContext } from "@oasisdex/transactions";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";

import { Context } from "../network";
// import { GasPrice$ } from "../prices";

export function callAbstractContext<D, R, CC extends Context>(
  context: CC,
  { call, prepareArgs, postprocess }: CallDefAbstractContext<D, R, CC>
): (args: D) => Observable<R> {
  return (args: D) => {
    return from<R>(
      call(
        args,
        context
      )(...prepareArgs(args, context)).call(
        // spot neccessary to read osms in readonly
        { from: context.mcdSpot.address }
      )
    ).pipe(map((i: R) => (postprocess ? postprocess(i, args) : i)));
  };
}

export type CallDef<A, R> = CallDefAbstractContext<A, R, Context>;

export function call<D, R>(context: Context, callDef: CallDef<D, R>) {
  return callAbstractContext<D, R, Context>(context, callDef);
}
