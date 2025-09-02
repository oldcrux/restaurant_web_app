'use client';
import { useState, useEffect } from 'react';
import { getAccessTokenPayloadSecurely } from 'supertokens-web-js/recipe/session';

// for client side use
export async function getAccessTokenPayload() {
    return await getAccessTokenPayloadSecurely();
}

// for client side use where "use client" is used in files
export function getClientSessionUser() {
  const [sessionUser, setSessionUser] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchPayload() {
      try {
        const token = await getAccessTokenPayloadSecurely({});
        if (mounted) {
          setSessionUser(token.user);
        }
      } catch (err) {
        console.error("Failed to fetch token payload:", err);
      }
    }
    fetchPayload();
    return () => { mounted = false; };
  }, []);

  // console.log(`session user ${JSON.stringify(sessionUser)}`);
  return sessionUser;
}


export function isUserOrgAdmin() {
    const sessionUser = getClientSessionUser();
    return sessionUser?.permissions?.includes("org_admin");
}

export function isUserStoreAdmin() {
  const sessionUser = getClientSessionUser();
  return sessionUser?.permissions?.includes("store_write");
}

export function canCreateStore() {
   return isUserOrgAdmin();
}

export function canManageStore() {
  return isUserStoreAdmin();
}

export function canManageUser() {
  const sessionUser = getClientSessionUser();
  return sessionUser?.permissions?.includes("user_write");
}