import { prisma } from '../utils/db.server';
import { Prisma } from '@prisma/client';


type Production = {
    id: string;
    productType: string;
    startTime: Date;
    unitPrice: number;
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
                unitPrice: true,
                quantity: true,
                endTime: true,
                status: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true
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
                unitPrice: true,
                quantity: true,
                endTime: true,
                status: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true
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
                unitPrice: true,
                quantity: true,
                endTime: true,
                status: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true
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
                unitPrice: true,
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

export const deleteProduction = async (id: string): Promise<Production> => {
    try {
        // Find all FinishedProducts associated with the Production
        // const finishedProducts = await prisma.finishedProduct.findMany({
        //     where: {
        //         productionId: id
        //     }
        // });

        // Set their productionId to null
        // await Promise.all(finishedProducts.map(product =>
        //     prisma.finishedProduct.update({
        //         where: { id: product.id },
        //         data: { productionId: null }
        //     })
        // ));

        // Now you can safely delete the Production
        return await prisma.production.delete({
            where: { id: id }
        });
    } catch (error) {
        throw error;
    }
}

//GET production by user email
export const getProductionByEmail = async (email: string): Promise<Production[]> => {
    try {
        return await prisma.production.findMany({
            where: {
                user: {
                    email
                }
            },
            select: {
                id: true,
                productType: true,
                startTime: true,
                unitPrice: true,
                quantity: true,
                endTime: true,
                status: true,
                user: {
                    select: {
                        email: true,
                        name: true
                    }
                }
            }
        });
    } catch (error) {
        throw error;
    }
};