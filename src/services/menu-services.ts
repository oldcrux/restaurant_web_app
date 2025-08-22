import axios from 'axios';
import { MenuItem } from "@/lib/types";
import { getAccessTokenPayload } from '@/auth/supertokens/config/app-utils';

const nodeServerUrl = process.env.NEXT_PUBLIC_NODE_SERVER_URL;

export async function allMenuItems(){
    const accessTokenPayload = await getAccessTokenPayload();

    const isUserOrgAdmin = accessTokenPayload?.user.permissions.includes("org_admin");
    const orgName = accessTokenPayload?.user.organization.orgName;
    const storeName = isUserOrgAdmin ? "" : accessTokenPayload?.user.currentStore;

    // If user is Org Admin, fetch all menu items across stores. else fetch menu items for current store only.
    const queryParams = `orgName=${orgName}&storeName=${storeName}`;
    const response = await axios.get(`${nodeServerUrl}/api/menu-items?${queryParams}`, {
        headers: {
            'Content-Type': 'application/json',
        //   Authorization: `Bearer ${idToken}`,
        },
      });
      return response.data.data.items;
}

export async function createMenuItem(menu: MenuItem){
    const accessTokenPayload = await getAccessTokenPayload();

    const orgName = accessTokenPayload?.user.organization.orgName;
    // const storeName = accessTokenPayload?.user.currentStore;

    menu.orgName=orgName;
    // menu.storeName=storeName;
    menu.createdBy=accessTokenPayload?.user.userId;
    menu.updatedBy=accessTokenPayload?.user.userId;
    console.log(`creating Menu Item: ${JSON.stringify(menu)}`);
    const response = await axios.post(`${nodeServerUrl}/api/menu-items/create`, menu, {
        headers: {
            'Content-Type': 'application/json',
        //   Authorization: `Bearer ${idToken}`,
        },
      });
      return response.data;
    }

    export async function updateMenuItem(menu: MenuItem){
        const accessTokenPayload = await getAccessTokenPayload();

        const orgName = accessTokenPayload?.user.organization.orgName;
        // const storeName = accessTokenPayload?.user.currentStore;

        menu.orgName=orgName;
        // menu.storeName=storeName;
        menu.updatedBy=accessTokenPayload?.user.userId;

        const response = await axios.post(`${nodeServerUrl}/api/menu-items/update`, menu, {
            headers: {
                'Content-Type': 'application/json',
            //   Authorization: `Bearer ${idToken}`,
            },
          });
          return response.data;
        }
    
    export async function deleteMenuItem(menuItemName: string){
        const accessTokenPayload = await getAccessTokenPayload();

        const orgName = accessTokenPayload?.user.organization.orgName;
        const storeName = accessTokenPayload?.user.currentStore;

        const queryParams = `orgName=${orgName}&storeName=${storeName}`;
        console.log(`menu item name ${menuItemName}`)
        const response = await axios.post(`${nodeServerUrl}/api/menu-items/delete/${menuItemName}?${queryParams}`, {
            headers: {
                'Content-Type': 'application/json',
            //   Authorization: `Bearer ${idToken}`,
            },
          });
          return response.data;
        }
    