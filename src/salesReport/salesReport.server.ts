import { Prisma } from '@prisma/client';
import { prisma } from '../utils/db.server';

// Type definition (ensure this matches the actual schema and usage)
type SalesReport = {
    id: string;
    productType: string;
    salesDate: Date;
    quantitySold: number;
    totalRevenue: number;
};

// CREATE sales report
export const createSalesReport = async (salesReport: Prisma.SalesReportCreateInput): Promise<SalesReport> => {
    try {
        const newSalesReport = await prisma.salesReport.create({
            data: {
                ...salesReport,
            },
            select: {
                id: true,
                productType: true,
                salesDate: true,
                quantitySold: true,
                totalRevenue: true,
            }
        });
        return newSalesReport;
    } catch (error) {
        console.error('Error creating sales report:', error);
        throw error;
    }
};

//GET all sales reports
export const getAllSalesReports = async (): Promise<SalesReport[]> => {
    try {
        const salesReports = await prisma.salesReport.findMany({
            select: {
                id: true,
                productType: true,
                salesDate: true,
                quantitySold: true,
                totalRevenue: true,
                createdAt: true,
            }
        });
        return salesReports;
    } catch (error) {
        console.error('Error fetching sales reports:', error);
        throw error;
    }
};

//GET sales report by id
export const getSalesReportById = async (id: string): Promise<SalesReport> => {
    try {
        const salesReport = await prisma.salesReport.findUnique({
            where: {
                id: id,
            },
            select: {
                id: true,
                productType: true,
                salesDate: true,
                quantitySold: true,
                totalRevenue: true,
                createdAt: true,
            }
        });

        if (!salesReport) {
            throw new Error(`No SalesReport found with id: ${id}`);
        }

        return salesReport;
    } catch (error) {
        console.error('Error fetching sales report:', error);
        throw error;
    }
};

//DELETE sales report by id
export const deleteSalesReport = async (id: string): Promise<SalesReport> => {
    try {
        const deletedSalesReport = await prisma.salesReport.delete({
            where: {
                id: id,
            },
            select: {
                id: true,
                productType: true,
                salesDate: true,
                quantitySold: true,
                totalRevenue: true,
                createdAt: true,
            }
        });

        return deletedSalesReport;
    } catch (error) {
        console.error('Error deleting sales report:', error);
        throw error;
    }
};