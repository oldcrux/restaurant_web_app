import { getAccessTokenPayloadSecurely } from 'supertokens-web-js/recipe/session';

// for client side use
export async function getAccessTokenPayload() {
    return await getAccessTokenPayloadSecurely();
}
