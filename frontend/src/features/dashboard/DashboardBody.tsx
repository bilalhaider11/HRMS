
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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white font-inter">Dashboard</h1>
        <p className="text-sm text-slate-400 font-inter mt-1">Overview of your organization at a glance</p>
      </div>

      <Cards loader={authCheckLoading} />
      <MarketStats />
      <Portfolio />
      <Holdings />
      <Watchlist />
      <Transaction />
    </div>
  );
};

export default DashboardBody;
