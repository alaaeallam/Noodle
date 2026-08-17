import { useMutation } from "@apollo/client";
import { MARK_ORDER_READY_FOR_PICKUP } from "../api/graphql";

export default function useMarkOrderReady() {
  const [mutateMarkReady, { loading, error }] = useMutation(
    MARK_ORDER_READY_FOR_PICKUP,
  );
  const markOrderReadyFunc = (_id: string) => {
    return mutateMarkReady({ variables: { _id } });
  };

  return { loading, error, markOrderReady: markOrderReadyFunc };
}
