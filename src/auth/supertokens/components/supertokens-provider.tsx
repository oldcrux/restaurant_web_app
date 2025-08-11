"use client";

import React from "react";
import SuperTokens from 'supertokens-web-js';
import { ensureSuperTokensInit } from '../config/supertokens-config';

import { usePathname, useRouter } from "next/navigation";
const routerInfo: { router?: ReturnType<typeof useRouter>; pathName?: string } = {};

if (typeof window !== "undefined") {
    // we only want to call this init function on the frontend, so we check typeof window !== 'undefined'
    // console.log("Initializing SuperTokens");
    ensureSuperTokensInit();
}

export function setRouter(router: ReturnType<typeof useRouter>, pathName: string) {
    routerInfo.router = router;
    routerInfo.pathName = pathName;
}

export const SuperTokensProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    setRouter(useRouter(), usePathname() || window.location.pathname);

    return <>{children}</>;
};
