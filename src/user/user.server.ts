import { prisma } from '../utils/db.server';

type User = {
    id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    position?: string;
};

//GET ALL USERS
const getUsers = async (): Promise<User[]> => {
    return prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            password: true,
            role: true,
            position: true
        }
    });
}
