import { Prisma } from '@prisma/client';
import { prisma } from '../utils/db.server';

type FinishedProduct = {
    productType: string;
    quantity: number;
    status: string;
    unitPrice: number;
    totalCost?: number;
    productionId?: string;
};

//CREATE finishedproduct
export const createFinishedProduct = async (finishedProduct: Prisma.FinishedProductCreateInput): Promise<FinishedProduct> => {
    try {
        const newFinishedProduct = await prisma.finishedProduct.create({
            data: finishedProduct,
            select: {
                productType: true,
                quantity: true,
                status: true,
                unitPrice: true,
                totalCost: true,
                productionId: true
            }
        });
        return newFinishedProduct;
    } catch (error) {
        console.error('Error creating finished product:', error);
        throw error;
    }
};