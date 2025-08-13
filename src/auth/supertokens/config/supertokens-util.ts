import JsonWebToken from "jsonwebtoken";
import type { JwtHeader, JwtPayload, SigningKeyCallback } from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { SuperTokensConfig } from "./supertokens-config";
import { cookies } from "next/headers";


const client = jwksClient({
    jwksUri: `${SuperTokensConfig.appInfo.apiDomain}${SuperTokensConfig.appInfo.apiBasePath}jwt/jwks.json`,
});

async function verifyToken(token: string): Promise<JwtPayload> {
    const getPublicKey = (header: JwtHeader, callback: SigningKeyCallback) => {
        client.getSigningKey(header.kid, (err, key) => {
            if (err) {
                callback(err);
            } else {
                const signingKey = key?.getPublicKey();
                callback(null, signingKey);
            }
        });
    };

    return new Promise((resolve, reject) => {
        JsonWebToken.verify(token, getPublicKey, {}, (err, decoded) => {
            if (err) {
                reject(err);
            } else {
                resolve(decoded as JwtPayload);
            }
        });
    });
}

export async function getAccessToken() {
    const cookiesStore = await cookies();
    return cookiesStore.get("sAccessToken")?.value;
}

export async function getSessionForSSR(): Promise<{
    accessTokenPayload: JwtPayload | undefined;
    hasToken: boolean;
    error: Error | undefined;
}> {
    const accessToken = await getAccessToken();
    const hasToken = !!accessToken;
    try {
        if (accessToken) {
            const decoded = await verifyToken(accessToken);
            return { accessTokenPayload: decoded, hasToken, error: undefined };
        }
        return { accessTokenPayload: undefined, hasToken, error: undefined };
    } catch (error) {
        return { accessTokenPayload: undefined, hasToken, error: undefined };
    }
}

// for server side use
export async function getSessionUser() {
    const { accessTokenPayload } = await getSessionForSSR();
    // console.log(`session user ${JSON.stringify(accessTokenPayload?.user)}`);
    return accessTokenPayload?.user;
}
