import {debug, info} from './logging.mjs'

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

export const prisma = new PrismaClient();

async function makeRole(name) {
    const exists = await prisma.role.findUnique({where: {name}})
    if (exists) {
        debug({description: `Role ${name} found.`});
        return;
    }

    await prisma.role.create({data: {name} });
    info({description: `Role ${name} created!`});
}

async function makeAdmin() {
    const login = process.env.DEFAULT_ADMIN_NAME;
    const password = await bcrypt.hash(
        process.env.DEFAULT_ADMIN_PWD,
        await bcrypt.genSalt()
    );

    const exists = await prisma.user.findFirst({
        where: {
            roles: {
                some: {
                    name: 'ADMIN'
                }
            }
        }
    });
    if (exists) {
        debug({description: `Administrator found.`});
        return;
    }

    await prisma.user.create({
        data: {
            name: 'Administrator',
            login,
            password,
            email: 'elias157508@gmail.com',
            authentication: 'local',
            roles: {
                connect: [
                    {name: 'ADMIN'}, {name: 'USER'}
                ]
            }
        }
    });
    info("Default administrator created!");
}

export async function bootstrapDb() {
    debug({description: "Checking initial data..."});
    await makeRole('ADMIN');
    await makeRole('USER');
    await makeAdmin();    
}