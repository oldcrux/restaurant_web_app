import { Order, OrderDetails } from '@/lib/types';
import axios from 'axios';
import { getAccessTokenPayload } from '@/auth/supertokens/config/app-utils';
const nodeServerUrl = process.env.NEXT_PUBLIC_NODE_SERVER_URL;

export async function allOrders() {
    const accessTokenPayload = await getAccessTokenPayload();
    // console.log(`all orders: ${JSON.stringify(accessTokenPayload?.user)}`);
    const orgName = accessTokenPayload?.user.organization.orgName;
    const storeName = accessTokenPayload?.user.currentStore;
    const queryParams = `orgName=${orgName}&storeName=${storeName}`;
    const response = await axios.get(`${nodeServerUrl}/api/order?${queryParams}`, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.data;
}

export async function createOrder(order: Order) {
    const accessTokenPayload = await getAccessTokenPayload();

    const orgName = accessTokenPayload?.user.organization.orgName;
    const storeName = accessTokenPayload?.user.currentStore;

    order.storeName=storeName;
    order.orgName=orgName;
    order.createdBy=accessTokenPayload?.user.userId;
    order.updatedBy=accessTokenPayload?.user.userId;
    console.log(`order create: ${JSON.stringify(order)}`);
    const response = await axios.post(`${nodeServerUrl}/api/order/create`, order, {
        headers: {
            'Content-Type': 'application/json',
            //   Authorization: `Bearer ${idToken}`,
        },
    });
    return response.data;
}

export async function updateOrder(order: Order) {
    const accessTokenPayload = await getAccessTokenPayload();

    const orgName = accessTokenPayload?.user.organization.orgName;
    const storeName = accessTokenPayload?.user.currentStore;

    order.storeName=storeName;
    order.orgName=orgName;
    order.updatedBy=accessTokenPayload?.user.userId;
    const response = await axios.post(`${nodeServerUrl}/api/order/update`, order, {
        headers: {
            'Content-Type': 'application/json',
            //   Authorization: `Bearer ${idToken}`,
        },
    });
    return response.data;
}

export async function updateOrderStatusToDelivered(order: Order) {
    const accessTokenPayload = await getAccessTokenPayload();

    const orgName = accessTokenPayload?.user.organization.orgName;
    const storeName = accessTokenPayload?.user.currentStore;

    order.storeName=storeName;
    order.orgName=orgName;
    order.updatedBy=accessTokenPayload?.user.userId;
    const response = await axios.post(`${nodeServerUrl}/api/order/update/status/delivered`, order, {
        headers: {
            'Content-Type': 'application/json',
            //   Authorization: `Bearer ${idToken}`,
        },
    });
    return response.data;
}

export async function updateOrderStatus(order: Order) {
    const accessTokenPayload = await getAccessTokenPayload();

    const orgName = accessTokenPayload?.user.organization.orgName;
    const storeName = accessTokenPayload?.user.currentStore;

    order.storeName=storeName;
    order.orgName=orgName;
    order.updatedBy=accessTokenPayload?.user.userId;
    // TODO make sure order has orderId and status value
    // console.log(`order status update: ${JSON.stringify(order)}`);
    const response = await axios.post(`${nodeServerUrl}/api/order/update/status`, order, {
        headers: {
            'Content-Type': 'application/json',
            //   Authorization: `Bearer ${idToken}`,
        },
    });
    return response.data;
}

export async function updateOrderDetailStatus(orderDetails: OrderDetails) {
    const accessTokenPayload = await getAccessTokenPayload();

    const orgName = accessTokenPayload?.user.organization.orgName;
    const storeName = accessTokenPayload?.user.currentStore;

    orderDetails.updatedBy=accessTokenPayload?.user.userId;
    // TODO make sure order has orderId and status value
    console.log(`order status update: ${JSON.stringify(orderDetails)}`);
    const response = await axios.post(`${nodeServerUrl}/api/order/update/orderDetail/status`, orderDetails, {
        headers: {
            'Content-Type': 'application/json',
            //   Authorization: `Bearer ${idToken}`,
        },
    });
    return response.data;
}

export async function cancelOrder(  order: Order) {
    const accessTokenPayload = await getAccessTokenPayload();

    const orgName = accessTokenPayload?.user.organization.orgName;
    const storeName = accessTokenPayload?.user.currentStore;

    order.storeName=storeName;
    order.orgName=orgName;
    order.updatedBy=accessTokenPayload?.user.userId;
    order.status='CANCELLED';
    // TODO make sure order has orderId and status value
    // console.log(`order status update: ${JSON.stringify(order)}`);
    const response = await axios.post(`${nodeServerUrl}/api/order/update/status`, order, {
        headers: {
            'Content-Type': 'application/json',
            //   Authorization: `Bearer ${idToken}`,
        },
    });
    return response.data;
}


// export async function deleteOrder(idToken: string, orgName: string, storeName: string, orderId: string) {
//     const queryParams = `orgName=${orgName}&storeName=${storeName}`;
//     console.log(`order id ${orderId}`)
//     const response = await axios.post(`${nodeServerUrl}/api/order/delete/${orderId}?${queryParams}`, {
//         headers: {
//             'Content-Type': 'application/json',
//             //   Authorization: `Bearer ${idToken}`,
//         },
//     });
//     return response.data;
// }

