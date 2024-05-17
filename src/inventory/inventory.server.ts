import { prisma } from '../utils/db.server';
import { Prisma } from '@prisma/client';

type Inventory = {
    type: string;
    quantity: number;
}

//ADD TO INVENTORY from production
export const addToInventory = async (type: string, quantity: number): Promise<Inventory> => {
    try {
        const inventory = await prisma.inventoryData.create({
            data: {
                type,
                quantity
            }
        });
        return inventory;
    } catch (error) {
        console.error('Error adding to inventory:', error);
        throw error;
    }
};

