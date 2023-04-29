import { createToken } from "../../lib/security.mjs";
import { loadByCredentials, loadById, insertUser } from "./repository.mjs";
import { newAxios } from "../../lib/network.mjs";

export async function login(user) {
    const requestUser = await loadByCredentials(user.login, user.password);

    if (requestUser) return {
        token: createToken(requestUser),
        ...requestUser
    };
    return null;
}

export async function getUser(id) {
    const user = await loadById(id);;

    return user;
}

async function requestData(code) {
    const axios = newAxios();

    const client_id = process.env.CLIENT_ID;
    const client_secret = process.env.CLIENT_SECRET;

    const { data } = await axios.post(
        'https://github.com/login/oauth/access_token', {
        'grant_type': 'authorization_code',
        'code': code,
        'client_id': client_id,
        'client_secret': client_secret
    },
        {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }
    );

    const requestUser = await axios.get(
        'https://api.github.com/user',
        {
            headers: {
                'Authorization': "Bearer " + data.access_token
            }
        }
    );
    return requestUser;
}
export async function saveUser(user) {
    if (user.authentication === 'github') {
        const requestUser = await requestData(user.code);

        if (requestUser.data.message) return requestUser.data.message;

        user.name = requestUser.data.name;
        user.login = requestUser.data.login;
        user.email = requestUser.data.email;
    }
    return insertUser(user);
}

