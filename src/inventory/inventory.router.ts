import express from 'express';
import type {  Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

import * as inventoryServer from './inventory.server';

export const inventoryRouter = express.Router();

//add to inventory from production
inventoryRouter.post(
    '/',
    body('type').isString().notEmpty(),
    body('quantity').isNumeric(),
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { type, quantity } = req.body;
        try {
            const inventory = await inventoryServer.addToInventory(type, quantity);
            res.json(inventory);
        } catch (error) {
            res.status(500).json({ error: 'Error adding to inventory' });
        }
    }
);

//ADD to inventory
inventoryRouter.post(
    '/',
    body('type').isString().notEmpty(),
    body('quantity').isInt(),
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { type, quantity } = req.body;
        try {
            const inventory = await inventoryServer.createInventoryData({
                type,
                quantity
            });
            res.json(inventory);
        } catch (error) {
            res.status(500).json({ error: 'Error adding to inventory' });
        }
    }
);

//GET all inventory data
inventoryRouter.get('/', async (request: Request, response: Response) => {
    try {
        const inventoryData = await inventoryServer.getInventoryData()
        response.json(inventoryData)
    } catch (error) {
        response.status(500).json({ error, message: 'Error fetching Inventory' });
    }
})

//GET inventory data by id
inventoryRouter.get('/:id', async (request: Request, response: Response) => {
    try {
        const inventoryData = await inventoryServer.getInventoryDataById(request.params.id);
        if (!inventoryData) {
            response.status(404).json({ error: 'User not found' });
            return;
        }
        response.json(inventoryData);
    } catch (error) {
        response.status(500).json({ error: 'Error fetching user by ID' });
    }
});

//UPDATE inventory data
inventoryRouter.put(
    '/:id',
    body('type').isString().notEmpty(),
    body('quantity').isInt(),
    async (request: Request, response: Response) => {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            response.status(400).json({ errors: errors.array() });
            return;
        }

        const { id } = request.params

        try {
            const inventory = await inventoryServer.updateInventoryData(id, request.body);
            response.json({ inventory, message: 'User updated successfully' });
        } catch (error) {
            
        }
    }
)

//DELETE inventory Data
inventoryRouter.delete('/:id', async (request: Request, response: Response) => {
    try {
        const inventoryData = await inventoryServer.deleteInventoryData(request.params.id);
        if (!inventoryData) {
            response.status(404).json({ error: 'Data not found' });
            return;
        }
        response.json({ inventoryData, message: 'Data deleted successfully' });
    } catch (error) {
        response.status(500).json({ error: 'Error deleting data' });
    }
});