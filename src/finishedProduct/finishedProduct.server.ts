
import { Prisma } from '@prisma/client';
import { prisma } from '../utils/db.server';

type FinishedProduct = {
    productType: string;
    quantity: number;
    status: string;
    unitPrice: number;
    totalCost?: number;
    productionId?: string | null;
};

//CREATE finishedproduct
export const createFinishedProduct = async (finishedProduct: Prisma.FinishedProductCreateInput): Promise<FinishedProduct> => {
    try {
        const newFinishedProduct = await prisma.finishedProduct.create({
            data: {
                ...finishedProduct,
            },
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

//UPDATE finished product
export const updateFinishedProduct = async (id: string, finishedProduct: Partial<FinishedProduct>): Promise<FinishedProduct> => {
    try {
        return await prisma.finishedProduct.update({
            where: { id },
            data: finishedProduct,
            select: {
                id: true,
                productType: true,
                quantity: true,
                unitPrice: true,
                totalCost: true,
                status: true
            },
        });
        
    } catch (error) {
        console.error('Error updating Finished Product:', error);
        throw error;
    }
};

//DELETE finished product but not the sales report
export const deleteFinishedProduct = async (id: string): Promise<FinishedProduct> => {
    try {
        // // Find all SalesReports associated with the FinishedProduct
        // const salesReports = await prisma.salesReport.findMany({
        //     where: {
        //         finishedProductId: id
        //     }
        // });

        // // Set their finishedProductId to null
        // await Promise.all(salesReports.map(report =>
        //     prisma.salesReport.update({
        //         where: { id: report.id },
        //         data: { finishedProductId: null }
        //     })
        // ));

        // Now you can safely delete the FinishedProduct
        return await prisma.finishedProduct.delete({
            where: { id: id }
        });
    } catch (error) {
        throw error;
    }
}

//GET all finished product
export const getFinishedProduct = async(): Promise<FinishedProduct[]> => {
    try {
        return await prisma.finishedProduct.findMany({
            select: {
                id: true,
                productType: true,
                quantity: true,
                unitPrice: true,
                totalCost: true,
                status: true,
                production: {
                    select: {
                        id: true,
                        user: { 
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        })
    } catch (error) {
        throw error;
    }
}

//GET finished product by id
export const getFinishedProductbyId = async (id: string): Promise<FinishedProduct | null> => {
    try {
        return await prisma.finishedProduct.findUnique({
            where: { id },
            select: {
                id: true,
                productType: true,
                quantity: true,
                unitPrice: true,
                totalCost: true,
                status: true
            }
        })
    } catch (error) {
        throw error;
    }
};
