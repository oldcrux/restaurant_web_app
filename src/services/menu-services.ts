import axios from 'axios';
import { MenuItem } from "@/lib/types";
import { getAccessTokenPayload } from '@/auth/supertokens/config/app-utils';

const nodeServerUrl = process.env.NEXT_PUBLIC_NODE_SERVER_URL;

export async function allMenuItems(){
    const accessTokenPayload = await getAccessTokenPayload();

    const orgName = accessTokenPayload?.user.organization.orgName;
    const storeName = accessTokenPayload?.user.currentStore;

    const queryParams = `orgName=${orgName}&storeName=${storeName}`;
    const response = await axios.get(`${nodeServerUrl}/api/menu-items?${queryParams}`, {
        headers: {
            'Content-Type': 'application/json',
        //   Authorization: `Bearer ${idToken}`,
        },
      });
      return response.data;
}

export async function createMenuItem(menu: MenuItem){
    const accessTokenPayload = await getAccessTokenPayload();

    const orgName = accessTokenPayload?.user.organization.orgName;
    const storeName = accessTokenPayload?.user.currentStore;

    menu.orgName=orgName;
    menu.storeName=storeName;
    menu.createdBy=accessTokenPayload?.user.userId;
    menu.updatedBy=accessTokenPayload?.user.userId;
    console.log(`menu create: ${JSON.stringify(menu)}`);
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
        const storeName = accessTokenPayload?.user.currentStore;

        menu.orgName=orgName;
        menu.storeName=storeName;
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
    