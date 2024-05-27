import express from 'express';
import type {  Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

import * as finishedProductServer from './finishedProduct.server';
import * as salesReportServer from '../salesReport/salesReport.server';

export const finishedProductRouter = express.Router();

//CREATE finishedProduct
finishedProductRouter.post(
    '/', 
    body('productType').isString().notEmpty(),
    body('quantity').isInt().toInt(),
    body('status').isString().notEmpty(),
    body('unitPrice').isInt().toInt(),
    body('totalCost').isInt().toInt(),
    async (request: Request, response: Response) => {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            response.status(400).json({ errors: errors.array() });
            return;
        }

        const { productType, quantity, status, unitPrice, totalCost, productionId } = request.body;

        try {
            const finishedProduct = await finishedProductServer.createFinishedProduct({
                productType,
                quantity,
                status,
                unitPrice,
                totalCost,
                production: {
                    connect: {
                        id: productionId
                    }
                }
            }); 
            response.json(finishedProduct)
        } catch (error) {
            response.status(500).json({error: 'Error creating Finished Product'})
        }
    }
)

//UPDATE finished product
finishedProductRouter.put(
    '/:id',
    [
        body('productType').isString().notEmpty(),
        body('quantity').isInt().toInt(),
        body('status').isString().notEmpty(),
        body('unitPrice').isInt().toInt(),
        body('totalCost').isInt().toInt(),
    ],
    async (request: Request, response: Response) => {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            response.status(400).json({ errors: errors.array() });
            return;
        }

        const { id } = request.params;
        const { productType, unitPrice, status, quantity, totalCost } = request.body;

        const finishedProductExist = await prisma.finishedProduct.findUnique({
            where: {
                id: id
            }
        });
        
        if (!finishedProductExist) {
            response.status(404).json({ error: 'Production not found' });
            return;
        }

        try {
            const finishedProduct = await finishedProductServer.updateFinishedProduct(id, request.body);

            if (status === 'SOLD') {
                //Add to sales report
                await salesReportServer.createSalesReport({
                    productType,
                    salesDate: new Date(),
                    quantitySold: quantity,
                    totalRevenue: unitPrice * quantity,
                });
            }
            response.json({ finishedProduct, message: 'Finished Product updated successfully' });
        } catch (error) {
            response.status(500).json({ error: 'Error updating Finished Product' });
        }
    }
);

//GET all finished product
finishedProductRouter.get('/', async (request: Request, response: Response) => {
    try {
        const finishedProduct = await finishedProductServer.getFinishedProduct()
        response.json(finishedProduct)
    } catch (error) {
        response.status(500).json({ error, message: 'Error fetching Inventory' });
    }
})


//GET finished product by id
finishedProductRouter.get('/:id', async (request: Request, response: Response) => {
    try {
        const finishedProduct = await finishedProductServer.getFinishedProductbyId(request.params.id);
        if (!finishedProduct) {
            response.status(404).json({ error: 'Finished Product not found' });
            return;
        }
        response.json(finishedProduct);
    } catch (error) {
        response.status(500).json({ error: 'Error fetching Finished Product by ID' });
    }
});

//DELETE finished product
finishedProductRouter.delete('/:id', async (request: Request, response: Response) => {
    try {
        const finishedProduct = await finishedProductServer.deleteFinishedProduct(request.params.id);
        if (!finishedProduct) {
            response.status(404).json({ error: 'Finished Product not found' });
            return;
        }
        response.json({ finishedProduct, message: 'Finished Product deleted successfully' });
    } catch (error) {
        response.status(500).json({ error: 'Error deleting Finished Product' });
    }
});