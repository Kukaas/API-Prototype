import express from 'express';
import type {  Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

import * as productionServer from './production.server';
import * as inventoryServer from '../inventory/inventory.server';
import * as finishedProductServer from '../finishedProduct/finishedProduct.server';

export const productionRouter = express.Router();

declare global {
    namespace Express {
      interface Request {
        user: {
          email: string;
          // add other properties of the user object if needed
        };
      }
    }
  }

//GET all productions
productionRouter.get('/', async (req: Request, res: Response) => {
    try {
        const productions = await productionServer.getProductions();
        res.json(productions);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching productions' });
    }
});

//GET production by ID
productionRouter.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const production = await productionServer.getProductionById(id);
        if (!production) {
            res.status(404).json({ error: 'Production not found' });
            return;
        }
        res.json(production);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching production by ID' });
    }
});

//CREATE production
productionRouter.post(
    '/',
    body('productType').isString().notEmpty(),
    body('startTime').isISO8601().toDate(),
    body('unitPrice').isInt().toInt(),
    body('status').isString().notEmpty(),
    body('quantity').isInt().toInt(),
    body('userEmail').isEmail(),
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { productType, startTime, unitPrice, quantity, status, userEmail } = req.body;

        const userExists = await prisma.user.findUnique({
            where: {
                email: userEmail
            }
        });
        
        if (!userExists) {
            throw new Error('User not found');
        }
        
        try {
            const production = await productionServer.createProduction({
                productType,
                startTime,
                unitPrice,
                quantity,
                status,
                user: {
                    connect: {
                        email: userEmail
                    }
                }
            });
            res.json(production);
        } catch (error) {
            res.status(500).json({ error: 'Error creating production' });
        }
    }
);

//UPDATE production by email
productionRouter.put(
    '/:id',
    body('productType').isString().notEmpty(),
    body('unitPrice').isInt().toInt(),
    body('status').isString().notEmpty(),
    body('quantity').isInt().toInt(),
    body('userEmail').isEmail(),
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { id } = req.params;
        const { productType,  unitPrice, status, quantity, userEmail } = req.body;
        
        let updateData: any = {
            productType,
            unitPrice,
            quantity,
            status,
            user: {
                connect: {
                    email: userEmail
                }
            }
        };

        if (status === 'COMPLETED') {
            updateData.endTime = new Date(); // Automatically set endTime to current date and time
        }

        const productionExists = await prisma.production.findUnique({
            where: {
                id: id
            }
        });
        
        if (!productionExists) {
            res.status(404).json({ error: 'Production not found' });
            return;
        }

        try {
            const production = await productionServer.updateProduction(id, updateData);

            if (status === 'COMPLETED') {
                // Automatically add to inventory
                const quantity = production.quantity; // replace with the actual logic to determine the quantity
                await inventoryServer.addToInventory(productType, quantity);
                
                await finishedProductServer.createFinishedProduct({
                    productType: production.productType,
                    quantity: production.quantity,
                    status: 'AVAILABLE',
                    unitPrice: production.unitPrice,
                    totalCost: quantity * unitPrice,
                });
            }

            res.json(production);
        } catch (error) {
            res.status(500).json({ error: 'Error updating production' });
        }
    }
);

//DELETE production by id
productionRouter.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const production = await productionServer.deleteProduction(id);
        if (!production) {
            res.status(404).json({ error: 'Production not found' });
            return;
        }
        res.json(production);
    } catch (error) {
        res.status(500).json({ error: 'Error deleting production' });
    }
});

//GET production by email
productionRouter.get('/email/:email', async (req: Request, res: Response) => {
    const { email } = req.params;
    try {
        const productions = await productionServer.getProductionByEmail(email);
        res.json(productions);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching productions by email' });
    }
});