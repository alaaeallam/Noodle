import { useContext } from "react";
import { ConfigurationContext } from "@/lib/context/global/configuration.context";

// The platform's configured currency symbol (e.g. "EGP"), for screens that
// used to hard-code "$".
export const useCurrencySymbol = () =>
  useContext(ConfigurationContext)?.currencySymbol ?? "";
