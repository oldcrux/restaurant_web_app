import SuperTokens from 'supertokens-web-js';
import Session from 'supertokens-web-js/recipe/session';
import EmailPassword from 'supertokens-web-js/recipe/emailpassword'
import ThirdParty from 'supertokens-web-js/recipe/thirdparty'
import Passwordless from 'supertokens-web-js/recipe/passwordless'

export const SuperTokensConfig = {
    // enableDebugLogs: true,
    appInfo: {
        appName: "OldCrux voice application",
        apiDomain: process.env.NEXT_PUBLIC_NODE_SERVER_URL || '',
        apiBasePath: "/auth/",
    },
    recipeList: [
        EmailPassword.init(),
        // ThirdParty.init({
        //     signInAndUpFeature: {
        //         providers: [
        //             {
        //                 config: {
        //                     thirdPartyId: "google",
        //                     clientId: process.env.GOOGLE_CLIENT_ID,
        //                     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        //                 }
        //             }
        //         ],
        //     },
        // }),
        // Passwordless.init({
        //     contactMethod: "EMAIL"
        // }),
        Session.init()
    ],
};


let initialized = false;
export function ensureSuperTokensInit() {
    if (!initialized) {
        SuperTokens.init(SuperTokensConfig);
        initialized = true;
    }
}