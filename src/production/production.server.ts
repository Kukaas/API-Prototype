import { prisma } from '../utils/db.server';
import { Prisma } from '@prisma/client';


type Production = {
    id: string;
    productType: string;
    startTime: Date;
    quantity: number;
    endTime?: Date | null;
    status: string;
}

//GET ALL PRODUCTIONS
export const getProductions = async (): Promise<Production[]> => {
    try {
        return await prisma.production.findMany({
            select: {
                id: true,
                productType: true,
                startTime: true,
                quantity: true,
                endTime: true,
                status: true,
                user: {
                    select: {
                        email: true
                    }
                },
            },
        });
    } catch (error) {
        console.error('Error fetching productions:', error);
        throw error; // re-throw the error to be handled by the caller or an error handler middleware
    }
};

//GET production by ID
export const getProductionById = async (id: string): Promise<Production | null> => {
    try {
        return await prisma.production.findUnique({
            where: { id },
            select: {
                id: true,
                productType: true,
                startTime: true,
                quantity: true,
                endTime: true,
                status: true,
                user: {
                    select: {
                        email: true
                    }
                },
            },
        });
    } catch (error) {
        console.error('Error fetching production by ID:', error);
        throw error;
    }
};

//CREATE production
export const createProduction = async (production: Prisma.ProductionCreateInput): Promise<Production> => {
    try {
        return await prisma.production.create({
            data: production,
            select: {
                id: true,
                productType: true,
                startTime: true,
                quantity: true,
                endTime: true,
                status: true,
                user: {
                    select: {
                        email: true
                    }
                },
            },
        });
    } catch (error) {
        console.error('Error creating production:', error);
        throw error;
    }
};

//UPDATE production
export const updateProduction = async (id: string, production: Prisma.ProductionUpdateInput): Promise<Production> => {
    try {
        return await prisma.production.update({
            where: { id },
            data: production,
            select: {
                id: true,
                productType: true,
                startTime: true,
                quantity: true,
                endTime: true,
                status: true,
                user: {
                    select: {
                        email: true
                    }
                },
            },
        });
    } catch (error) {
        console.error('Error updating production:', error);
        throw error;
    }
};