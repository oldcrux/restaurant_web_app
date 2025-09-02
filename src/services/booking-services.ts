import { getAccessTokenPayload } from "@/auth/supertokens/config/app-utils";
import { Booking } from "@/lib/types";
import axios from "axios";

const nodeServerUrl = process.env.NEXT_PUBLIC_NODE_SERVER_URL;

// export async function allMenuItems(){
//     const accessTokenPayload = await getAccessTokenPayload();

//     const orgName = accessTokenPayload?.user.organization.orgName;
//     const storeName = accessTokenPayload?.user.currentStore;

//     const queryParams = `orgName=${orgName}&storeName=${storeName}`;
//     const response = await axios.get(`${nodeServerUrl}/api/menu-items?${queryParams}`, {
//         headers: {
//             'Content-Type': 'application/json',
//         //   Authorization: `Bearer ${idToken}`,
//         },
//       });
//       return response.data;
// }

export async function allBookings(){
    const accessTokenPayload = await getAccessTokenPayload();

    const orgName = accessTokenPayload?.user.organization.orgName;
    const storeName = accessTokenPayload?.user.currentStore;

    const queryParams = `orgName=${orgName}&storeName=${storeName}`;
    const response = await axios.get(`${nodeServerUrl}/api/booking?${queryParams}`, {
        headers: {
            'Content-Type': 'application/json',
        },
      });
      return response.data;
}

export async function createBooking(booking: Booking) {
    const accessTokenPayload = await getAccessTokenPayload();

    const orgName = accessTokenPayload?.user.organization.orgName;
    const storeName = accessTokenPayload?.user.currentStore;

    const bookingData = {
        ...booking,
        orgName,
        storeName,
        createdBy: accessTokenPayload?.user.userId,
        updatedBy: accessTokenPayload?.user.userId
    };
    
    console.log(`Creating booking:`, bookingData);
    const response = await axios.post(`${nodeServerUrl}/api/booking/create`, bookingData, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    
    return response.data;
}