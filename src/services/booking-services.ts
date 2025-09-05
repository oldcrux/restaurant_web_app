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

export async function updateBooking(booking: Booking) {
    const accessTokenPayload = await getAccessTokenPayload();

    const orgName = accessTokenPayload?.user.organization.orgName;
    const storeName = accessTokenPayload?.user.currentStore;

    const bookingData = {
        ...booking,
        orgName,
        storeName,
        updatedBy: accessTokenPayload?.user.userId
    };
    console.log(`Updating booking:`, bookingData);
    const response = await axios.post(`${nodeServerUrl}/api/booking/update`, bookingData, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.data;
}

export async function seatBooking(bookingId: string) {
    const accessTokenPayload = await getAccessTokenPayload();
    const userId = accessTokenPayload?.user.userId;

    const queryParams = `bookingId=${bookingId}&updatedBy=${userId}`;
    const response = await axios.post(`${nodeServerUrl}/api/booking/seat?${queryParams}`, {
        headers: {
            'Content-Type': 'application/json',
        },
    });

    return response.data;
}

export async function completeBooking(bookingId: string) {
    const accessTokenPayload = await getAccessTokenPayload();

    const userId = accessTokenPayload?.user.userId;

    const queryParams = `bookingId=${bookingId}&updatedBy=${accessTokenPayload?.user.userId}`;
    const response = await axios.post(`${nodeServerUrl}/api/booking/complete?${queryParams}`, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    
    return response.data;
}

export async function cancelBooking(bookingId: string) {
    const accessTokenPayload = await getAccessTokenPayload();

    const userId = accessTokenPayload?.user.userId;

    const queryParams = `bookingId=${bookingId}&updatedBy=${userId}`;
    const response = await axios.post(`${nodeServerUrl}/api/booking/cancel?${queryParams}`, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    
    return response.data;
}

export async function checkAvailability(date: string, partySize: number) {
    const accessTokenPayload = await getAccessTokenPayload();
    const userId = accessTokenPayload?.user.userId;
    const storeName = accessTokenPayload?.user.currentStore;
    const orgName = accessTokenPayload?.user.organization.orgName;

    console.log(`Checking availability for ${date} for ${partySize} guests`);
    // {{host}}/api/booking/availability/all?orgName=Acme Corporation&storeName=001&date=2025-09-05&partySize=20
    const queryParams = `orgName=${orgName}&storeName=${storeName}&date=${date}&partySize=${partySize}&updatedBy=${userId}`;
    const response = await axios.get(`${nodeServerUrl}/api/booking/availability/all?${queryParams}`, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.data;
}
    
