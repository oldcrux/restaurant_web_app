import axios from 'axios';
import { Store } from "@/lib/types";
import { getAccessTokenPayload } from '@/auth/supertokens/config/app-utils';
const nodeServerUrl = process.env.NEXT_PUBLIC_NODE_SERVER_URL;

export async function allStores() {
  const accessTokenPayload = await getAccessTokenPayload();
  const orgName = accessTokenPayload?.user.organization.orgName;
  const queryParams = `orgName=${orgName}`;
  // console.log(`all stores query params ${queryParams}`);
  const response = await axios.get(`${nodeServerUrl}/api/store?${queryParams}`, {
    headers: {
      'Content-Type': 'application/json',
      //   Authorization: `Bearer ${idToken}`,
    },
  });
  // console.log(`all stores data ${JSON.stringify(response.data)}`);
  return response.data;
}


export async function createStore(store: Store) {
  const accessTokenPayload = await getAccessTokenPayload();
  const orgName = accessTokenPayload?.user.organization.orgName;
  const userId = accessTokenPayload?.user.userId;

  store.orgName = orgName;
  store.createdBy = userId;
  store.updatedBy = userId;

  // console.log(`create store data ${JSON.stringify(store)}`);
  const response = await axios.post(`${nodeServerUrl}/api/store/create`, store, {
    headers: {
      'Content-Type': 'application/json',
      //   Authorization: `Bearer ${idToken}`,
    },
  });
  // console.log(`created store data ${JSON.stringify(response.data)}`);
  return response.status;
}

export async function updateStore(store: Store) {
  const accessTokenPayload = await getAccessTokenPayload();
  const orgName = accessTokenPayload?.user.organization.orgName;
  const userId = accessTokenPayload?.user.userId;
  // console.log(`updating vehicle data ${JSON.stringify(vehicle)}`);
  store.orgName = orgName;
  store.updatedBy = userId;
  const response = await axios.post(`${nodeServerUrl}/api/store/update`, store, {
    headers: {
      'Content-Type': 'application/json',
      //   Authorization: `Bearer ${idToken}`,
    },
  });
  return response.status;
}

export async function deActivateStore(store: Store) {
  const accessTokenPayload = await getAccessTokenPayload();
  const orgName = accessTokenPayload?.user.organization.orgName;
  const userId = accessTokenPayload?.user.userId;
  store.updatedBy = userId;
  // console.log(`updating vehicle data ${JSON.stringify(vehicle)}`);
  const queryParams = `orgName=${orgName}&storeName=${store.storeName}`;
  const response = await axios.post(`${nodeServerUrl}/api/store/deactivate?${queryParams}`, {
    headers: {
      'Content-Type': 'application/json',
      //   Authorization: `Bearer ${idToken}`,
    },
  });
  return response.status;
}

export async function activateStore(store: Store) {
  const accessTokenPayload = await getAccessTokenPayload();
  const orgName = accessTokenPayload?.user.organization.orgName;
  const userId = accessTokenPayload?.user.userId;
  store.updatedBy = userId;
  // console.log(`updating vehicle data ${JSON.stringify(vehicle)}`);
  const queryParams = `orgName=${orgName}&storeName=${store.storeName}`;
  const response = await axios.post(`${nodeServerUrl}/api/store/activate?${queryParams}`, {
    headers: {
      'Content-Type': 'application/json',
      //   Authorization: `Bearer ${idToken}`,
    },
  });
  return response.status;
}