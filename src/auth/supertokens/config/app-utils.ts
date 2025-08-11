import { getAccessTokenPayloadSecurely } from 'supertokens-web-js/recipe/session';

export async function getAccessTokenPayload() {
    return await getAccessTokenPayloadSecurely();
}
