import express from 'express';
import type {  Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

import * as finishedProductServer from './finishedProduct.server'

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
                
            })
            response.json(finishedProduct)
        } catch (error) {
            response.status(500).json({error: 'Error creating Finished Product'})
        }
    }
)