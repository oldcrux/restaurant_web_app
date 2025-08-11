import { getSessionForSSR } from "@/auth/supertokens/config/supertokens-util";
import { ChartAreaInteractive } from "./components/chart-area-interactive";
import { DataTable } from "./components/data-table";
import data from "./components/data.json";
import { SectionCards } from "./components/section-cards";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {

  const { accessTokenPayload, hasToken, error } = await getSessionForSSR();

  console.log("accessTokenPayload", accessTokenPayload);
  console.log("hasToken", hasToken);
  console.log("error", error);
  
  if (error) {
    return <div>Something went wrong while trying to get the session. Error - {error.message}</div>;
    // return redirect("/auth/login");
  }
  // `accessTokenPayload` will be undefined if it the session does not exist or has expired
  if (accessTokenPayload === undefined) {
    // if (!hasToken) {
      /**
       * This means that the user is not logged in. If you want to display some other UI in this
       * case, you can do so here.
       */
      console.log("session not found");
      return redirect("/auth/login");
    // }

    /**
     * This means that the session does not exist but we have session tokens for the user. In this case
     * the `TryRefreshComponent` will try to refresh the session.
     *
     * To learn about why the 'key' attribute is required refer to: https://github.com/supertokens/supertokens-node/issues/826#issuecomment-2092144048
     */
    // return <TryRefreshComponent key={Date.now()} />;
  }


  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      {/* <SectionCards /> */}
      {/* <ChartAreaInteractive /> */}
      {/* <DataTable data={data} /> */}
    </div>
  );
}
