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

  return sessionUser;
}
