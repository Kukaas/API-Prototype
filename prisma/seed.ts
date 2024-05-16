import { connect } from 'http2';
import {  prisma } from '../src/utils/db.server'
import { get } from 'http';


type User = {
    name: string;
    email: string;
    password: string;
    role: string;
    position?: string;
};

type Production = {
    productType: string;
    startTime: Date;
    endTime?: Date;
    status: string;
    userEmail: string;
    userName: string;
};

type FinishedProduct = {
    productType: string;
    quantity: number;
    unitPrice: number;
    totalCost: number;
    productionId: string;
};

type InventoryData = {
    type: string;
    quantity: number;
};

type SalesReport = {
    salesDate: Date;
    quantitySold: number;
    totalRevenue: number;
    finishedProductId: string;
};


async function seed() {
    // Create users
    await Promise.all(
        getUsers().map(async (user) => {
            // Check if a user with the given email already exists
            const existingUser = await prisma.user.findUnique({
                where: { email: user.email },
            });
    
            // If the user doesn't exist, create a new user
            if (!existingUser) {
                return prisma.user.create({
                    data: {
                        name: user.name,
                        email: user.email,
                        password: user.password,
                        role: user.role,
                        position: user.position,
                    },
                });
            }
        })
    );

    // Create productions
    await Promise.all(
        getProductions().map((production) => {
            return prisma.production.create({
                data: {
                    productType: production.productType,
                    startTime: production.startTime,
                    endTime: production.endTime,
                    status: production.status,
                    user: { 
                        connect: { 
                            email: production.userEmail,
                            name: production.userName
                        },
                    },
                },
            })
        })
    );

    

    // Create finished products
    await Promise.all(
        getFinishedProducts().map((finishedProduct) => {
            // Check if the finishedProduct has a valid productionId
            if (finishedProduct.productionId) {
                return prisma.finishedProduct.create({
                    data: {
                        productType: finishedProduct.productType,
                        quantity: finishedProduct.quantity,
                        unitPrice: finishedProduct.unitPrice,
                        totalCost: finishedProduct.totalCost,
                        productionId: finishedProduct.productionId,
                        inventoryData: {
                            create: {
                                type: finishedProduct.productType,
                                quantity: finishedProduct.quantity,
                            },
                        },
                    },
                });
            }
        })
    );


    // Create inventory data
    await Promise.all(
        getInventoryData().map((inventoryData) => {
            return prisma.inventoryData.create({
                data: {
                    type: inventoryData.type,
                    quantity: inventoryData.quantity,
                },
            })
        })
    );

    // Create sales reports
    await Promise.all(
        getSalesReports().map((salesReport) => {
            // Check if the salesReport has a valid finishedProductId
            if (salesReport.finishedProductId || salesReport.productionId) {
                return prisma.salesReport.create({
                    data: {
                        salesDate: salesReport.salesDate,
                        quantitySold: salesReport.quantitySold,
                        totalRevenue: salesReport.totalRevenue,
                        finishedProduct: {
                            connect: {
                                id: salesReport.finishedProductId,
                            },
                        },
                    },
                });
            }
        })
    );

}

seed()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });


// Get mock data for users
function getUsers(): Array<User> {
    return [
        {
            name: 'John Doe',
            email: 'Tato@example.com',
            password: 'password',
            role: 'admin',
            position: 'manager',
        },
        {
            name: 'Jane Doe',
            email: 'jane@gmail.com',
            password: 'password',
            role: 'employee',
            position: 'sewer',
        },
    ];
}

// Get mock data for productions
function getProductions(): Array<Production> {
    return [
        {
            productType: 'Polo',
            startTime: new Date('2022-01-01'),
            status: 'InProgress',
            userEmail: 'jane@gmail.com'
        },
        {
            productType: 'Pants',
            startTime: new Date('2022-01-15'),
            endTime: new Date('2022-01-20'),
            status: 'Completed',
            userEmail: 'Tato@example.com'
        },
    ];
}

// Get mock data for finished products
function getFinishedProducts(): Array<FinishedProduct> {
    return [
        {
            productType: 'Polo',
            quantity: 10,
            unitPrice: 20,
            totalCost: 200,
        },
        {
            productType: 'Pants',
            quantity: 20,
            unitPrice: 30,
            totalCost: 500,
        },
    ];
}

// Get mock data for inventory data
function getInventoryData(): Array<InventoryData> {
    return [
        {
            type: 'Sinulid',
            quantity: 100,
        },
        {
            type: 'Tela',
            quantity: 200,
        },
    ];
}

// Get mock data for sales reports
function getSalesReports(): Array<SalesReport> {
    return [
        {
            salesDate: new Date('2022-01-31'),
            quantitySold: 5,
            totalRevenue: 100,
        },
        {
            salesDate: new Date('2022-02-28'),
            quantitySold: 10,
            totalRevenue: 200,
        },
    ];
}



