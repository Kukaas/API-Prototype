import express from 'express';
import type {  Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

import * as salesReportServer from './salesReport.server'

export const salesReportRouter = express.Router();

//CREATE salesReport
salesReportRouter.post(
    '/', 
    body('productType').isString().notEmpty(),
    body('salesDate').isISO8601().toDate(),
    body('quantitySold').isInt().toInt(),
    body('totalRevenue').isInt().toInt(),
    async (request: Request, response: Response) => {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            response.status(400).json({ errors: errors.array() });
            return;
        }

        const { productType, salesDate, quantitySold, totalRevenue, finishedProductId} = request.body;

        try {
            const salesReport = await salesReportServer.createSalesReport({
                productType,
                salesDate,
                quantitySold,
                totalRevenue,
                finishedProduct: {
                    connect: {
                        id: finishedProductId
                    }
                }
            });
            response.json(salesReport)
        } catch (error) {
            response.status(500).json({error: 'Error creating Sales Report'})
        }
    }
)

//GET all salesReports
salesReportRouter.get(
    '/',
    async (request: Request, response: Response) => {
        try {
            const salesReports = await salesReportServer.getAllSalesReports();
            response.json(salesReports);
        } catch (error) {
            response.status(500).json({error: 'Error fetching Sales Reports'})
        }
    }
)

//GET sales report by product type
salesReportRouter.get(
    '/product-type/:productType',
    async (request: Request, response: Response) => {
        const { productType } = request.params;
        try {
            const salesReports = await salesReportServer.getSalesReportByProductType(productType);
            response.json(salesReports);
        } catch (error) {
            response.status(500).json({error: 'Error fetching Sales Reports'})
        }
    }
)

//GET salesReport by ID
salesReportRouter.get(
    '/:id',
    async (request: Request, response: Response) => {
        const { id } = request.params;
        try {
            const salesReport = await salesReportServer.getSalesReportById(id);
            response.json(salesReport);
        } catch (error) {
            response.status(500).json({error: 'Error fetching Sales Report'})
        }
    }
)

//DELETE salesReport by ID
salesReportRouter.delete(
    '/:id',
    async (request: Request, response: Response) => {
        const { id } = request.params;
        try {
            return await prisma.salesReport.delete({
                where: { id },
                select: {
                    id: true,
                    productType: true,
                    salesDate: true,
                    quantitySold: true,
                    totalRevenue: true,
                    createdAt: true,
                },
            });
        } catch (error) {
            console.error('Error deleting Sales Report:', error);
            throw error;
        }
    }
)