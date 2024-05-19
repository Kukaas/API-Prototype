import {  Prisma } from '@prisma/client';
import { prisma } from '../utils/db.server';
import { response } from 'express';

export type Inventory = {
    id: string,
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

//ADD to inventory
export const createInventoryData = async (inventoryData: Prisma.InventoryDataCreateInput): Promise<Inventory> => {
    try {
        const inventory = await prisma.inventoryData.create({
            data: inventoryData,
            select: {
                id: true,
                type: true,
                quantity: true
            }
        });
        return inventory;
    } catch (error) {
        console.error('Error adding to inventory:', error);
        throw error;
    }
};


//GET all items in the inventory
export const getInventoryData = async(): Promise<Inventory[]> => {
    try {
        return await prisma.inventoryData.findMany({
            select: {
                id: true,
                type: true,
                quantity: true,
                createdAt: true,
                updatedAt: true
            }
        })
    } catch (error) {
        response.status(500).json({error, message: 'Error fetching Inventory'})
        throw error;
    }
}

//GET inventory by id
export const getInventoryDataById = async (id: string): Promise<Inventory | null> => {
    try {
        return await prisma.inventoryData.findUnique({
            where: { id },
            select: {
                id: true,
                type: true,
                quantity: true,
                createdAt: true,
                updatedAt: true
            }
        })
    } catch (error) {
        throw error;
    }
}


//UPDATE inventory data
export const updateInventoryData = async (id: string, inventory: Partial<Inventory>): Promise<Inventory> => {
    try {
        return await prisma.inventoryData.update({
            where: { id },
            data: inventory,
            select: {
                id: true,
                type: true,
                quantity: true,
                createdAt: true,
                updatedAt: true
            },
        });
    } catch (error) {
        console.error('Error updating inventory:', error);
        throw error;
    }
};

//DELETE inventory by id
export const deleteInventoryData = async (id: string): Promise<Inventory> => {
    try {
        return await prisma.inventoryData.delete({
            where: { id },
            select: {
                id: true,
                type: true,
                quantity: true,
            },
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};