import { prisma } from '../utils/db.server';

export type Inventory = {
    type: string;
    quantity: number;
}

//ADD TO INVENTORY from production
export const addToInventory = async (type: string, quantity: number): Promise<Inventory> => {
    try {
        const inventory = await prisma.inventoryData.create({
            data: {
                type,
                quantity,
            }
        });
        return inventory;
    } catch (error) {
        console.error('Error adding to inventory:', error);
        throw error;
    }
};

//Remove from inventory
export const removeFromInventory = async (type: string, quantity: number): Promise<Inventory> => {
    try {
        // Find the inventory item by type
        const inventoryItem = await prisma.inventoryData.findFirst({
            where: { type }
        });

        if (!inventoryItem) {
            throw new Error(`Inventory item of type ${type} not found`);
        }

        // Update the inventory item
        const updatedInventory = await prisma.inventoryData.update({
            where: { id: inventoryItem.id },
            data: {
                quantity: {
                    decrement: quantity
                }
            }
        });

        return updatedInventory;
    } catch (error) {
        console.error('Error removing from inventory:', error);
        throw error;
    }
};

