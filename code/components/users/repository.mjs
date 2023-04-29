import {prisma} from '../../lib/database.mjs';
import bcrypt from "bcrypt";
import { badRequest, notFound, ServerError } from '../../lib/errors.mjs';

const USER_FIELDS = {
    id: true,
    name: true,
    email: true,
    login: true,
    password : false,
    authentication: true,
    roles: true,
    }

export const loadById = async(id) =>
    await prisma.user.findUnique({
        where: {id}, 
        select: USER_FIELDS
    });


export async function loadByCredentials(login, password) {
    const user = await prisma.user
        .findUnique({
            where: {login},
            select: {
                ...USER_FIELDS,
                password: true
            }
        });
    
    ServerError
        .throwIfNot(user, `Not Found: ${login}`, notFound)
        .throwIfNot(await bcrypt.compare(password, user.password), 
            "Invalid credentials")

    delete user.password;

    return user;
}

export async function insertUser(user) {
    const name = user.name
    const login = user.login
    const email = user.email
    const authentication = user.authentication
    const roles = user.roles

    const password = await bcrypt.hash(
        user.password,
        await bcrypt.genSalt()
    );

    const saved = await prisma.user.create({
        data: {
            name,
            email,
            authentication,
            login,
            password,
            roles: {
                connect: roles
            }
        }
    });

    delete saved.password;

    return saved;
}