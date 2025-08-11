import axios from 'axios';
import { User } from '../lib/types';
import { getAccessTokenPayload } from '@/auth/supertokens/config/app-utils';
const nodeServerUrl = process.env.NEXT_PUBLIC_NODE_SERVER_URL;

export async function createUser(user: User) {
  const accessTokenPayload = await getAccessTokenPayload();
  const userId = accessTokenPayload?.user.userId;
  const orgName = accessTokenPayload?.user.organization.orgName;
  
  user.userId = user.emailId;
  user.createdBy = userId
  user.updatedBy = userId;

  // if (user.authType === 'others') {
  //   user.password = "";
  // }
  
  const queryParams = `orgName=${orgName}`;
  console.log(`creating user data ${JSON.stringify(user)}`);
  const response = await axios.post(`${nodeServerUrl}/api/user/create?${queryParams}`, user, {
    headers: {
      'Content-Type': 'application/json',
      //   Authorization: `Bearer ${idToken}`,
    },
  });
  return response.status;
}

export async function updateUser(user: User) {
  const accessTokenPayload = await getAccessTokenPayload();
  const userId = accessTokenPayload?.user.userId;
  const orgName = accessTokenPayload?.user.organization.orgName;
  // console.log(`updating vehicle data ${JSON.stringify(vehicle)}`);

  user.updatedBy = userId;
  const queryParams = `orgName=${orgName}&storeName=${user.storeName}`;
  // console.log(`updating user data ${JSON.stringify(user)}`);
  
  const response = await axios.post(`${nodeServerUrl}/api/user/update?${queryParams}`, user, {
    headers: {
      'Content-Type': 'application/json',
      //   Authorization: `Bearer ${idToken}`,
    },
  });
  return response.status;
}

export async function fetchUser(userId: string) {
  // console.log(`fetching user with Id:`, userId);

  try {
    const response = await axios.get(`${nodeServerUrl}/api/user/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${jwtToken}`,
      },
    });
    const user = response.data;
    if (user.isActive == false) {
      throw new Error('User is not active.');
    }
    return user;
  } catch (error) {
    console.log('Failed to fetch user.', error);
    throw error;
  }
}

export async function allUsers() {
  try {
    const accessTokenPayload = await getAccessTokenPayload();
    const orgName = accessTokenPayload?.user.organization.orgName;
    const storeName = accessTokenPayload?.user.currentStore;
    const queryParams = `orgName=${orgName}&storeName=${storeName}`;
    const response = await axios.get(`${nodeServerUrl}/api/user?${queryParams}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    // console.log(`fetched user data ${JSON.stringify(response.data)}`);
    return response.data;
    // Ensure the response has the expected format
    // return {
    //   data: {
    //     users: Array.isArray(response.data) ? response.data : response.data.users || []
    //   }
    // };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { data: { users: [] } };
  }
}

export async function activateUser(user: User) {
  // console.log(`activating user data ${JSON.stringify(user)}`);
  const queryParams = `userId=${user.userId}`;
  const response = await axios.post(`${nodeServerUrl}/api/user/activate?${queryParams}`, user, {
    headers: {
      'Content-Type': 'application/json',
      // Authorization: `Bearer ${idToken}`,
    },
  });
  return response.status;
}


export async function deActivateUser(user: User) {
  // console.log(`deactivating user data ${JSON.stringify(user)}`);
  const queryParams = `userId=${user.userId}`;
  const response = await axios.post(`${nodeServerUrl}/api/user/deactivate?${queryParams}`, user, {
    headers: {
      'Content-Type': 'application/json',
      // Authorization: `Bearer ${idToken}`,
    },
  });
  return response.status;
}

export async function changeCurrentStore(storeName: string) {
    // console.log("Switching to store:", storeName);
    const user = await getAccessTokenPayload();
    const updatedUser = {
        userId: user?.user.userId,
        orgName: user?.user.organization.orgName,
        storeName: storeName,
    };
    //api/user/currentstore/update
    const response = await axios.post(`${nodeServerUrl}/api/user/currentstore/update`, updatedUser, {
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${idToken}`,
      },
    });
    return response.status;
}
