import { redirect } from 'next/navigation';
import Session from 'supertokens-web-js/recipe/session';

export async function logout() {
    await Session.signOut();
    redirect("/auth/login");
}
