
import MarketStats from "./ui/MarketStats/MarketStats";
import Portfolio from "./ui/Portfolio/Portfolio";
import Holdings from "./ui/Holdings/Holdings";
import Watchlist from "./ui/Watchlist/Watchlist";

import Transaction from "./ui/Transaction/Transaction";
import Cards from "./ui/Cards/Cards";
import { VerifyContext } from "../../app/VerifyContext";
import { useContext } from "react";


const DashboardBody = () => {
  const { authCheckLoading } = useContext(VerifyContext);
  return (
    <>
    <Cards loader={authCheckLoading} />
    <MarketStats />
    <Portfolio />
    <Holdings />
    <Watchlist />
    <Transaction />
    </>
  );
};

export default DashboardBody;
