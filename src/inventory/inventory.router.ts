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