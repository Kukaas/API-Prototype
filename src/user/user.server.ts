import { prisma } from '../utils/db.server';

type User = {
    id: string;
    name: string;
    address: string;
    birthDate: Date;
    email: string;
    password: string;
    role: string;
    position?: string | null;
};

//GET ALL USERS
export const getUsers = async (): Promise<User[]> => {
    try {
        return await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                birthDate: true,
                address: true,
                email: true,
                password: true,
                role: true,
                position: true,
            },
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error; // re-throw the error to be handled by the caller or an error handler middleware
    }
};

//GET user by ID
export const getUserById = async (id: string): Promise<User | null> => {
    try {
        return await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                birthDate: true,
                address: true,
                email: true,
                password: true,
                role: true,
                position: true,
            },
        });
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        throw error;
    }
};

//CREATE user
export const createUser = async (user: User): Promise<User> => {
    try {
        return await prisma.user.create({
            data: user,
            select: {
                id: true,
                name: true,
                birthDate: true,
                address: true,
                email: true,
                password: true,
                role: true,
                position: true,
            },
        });
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

//UPDATE user
export const updateUser = async (id: string, user: Partial<User>): Promise<User> => {
    try {
        const updateData: Partial<User> = {
            name: user.name,
            email: user.email,
            address: user.address,
            password: user.password,
            role: user.role,
            position: user.position
        };

        if (user.birthDate) {
            updateData.birthDate = new Date(user.birthDate);
        }

        return await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                birthDate: true,
                address: true,
                email: true,
                password: true,
                role: true,
                position: true,
            },
        });
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

//DELETE user
export const deleteUser = async (id: string): Promise<User> => {
    try {
        return await prisma.user.delete({
            where: { id },
            select: {
                id: true,
                name: true,
                birthDate: true,
                address: true,
                email: true,
                password: true,
                role: true,
                position: true,
            },
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};
