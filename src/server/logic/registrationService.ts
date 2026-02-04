import { type PrismaClient } from "../../../generated/prisma";

export const createUser = (
    db: PrismaClient,
    fname: string,
    lname: string,
    email: string,
    pnr: string,
    username: string,
    password: string,
) => {
    return db.user.create({
        data: {
            name: fname,
            surname: lname,
            email: email,
            pnr: pnr,
            username: username,
            password: password,
            role_id: 2,
        }
    })
}