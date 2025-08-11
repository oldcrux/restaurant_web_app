import axios from "axios";
const nodeServerUrl = process.env.NEXT_PUBLIC_NODE_SERVER_URL;


export async function allRoles() {
    const response = await axios.get(`${nodeServerUrl}/api/role`, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.data;
}