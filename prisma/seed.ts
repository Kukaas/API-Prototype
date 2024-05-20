import { prisma } from '../src/utils/db.server';

type User = {
  name: string;
  email: string;
  password: string;
  address: string;
  birthDate: Date;
  role: string;
  position?: string;
};

type Production = {
  productType: string;
  startTime: Date;
  quantity: number;
  unitPrice: number;
  endTime?: Date;
  status: string;
  userEmail: string;
};

type FinishedProduct = {
  productType: string;
  quantity: number;
  status: string;
  unitPrice: number;
  totalCost?: number;
  productionId?: string;
};

type InventoryData = {
  type: string;
  quantity: number;
};

type SalesReport = {
  producType: string;
  salesDate: Date;
  quantitySold: number;
  totalRevenue: number;
  finishedProductId?: string;
};

async function seed() {
  try {
    // Create users
    const users = await Promise.all(
        getUsers().map(async (user) => {
            const existingUser = await prisma.user.findUnique({
                where: { email: user.email },
            });

            if (!existingUser) {
                return prisma.user.create({
                    data: user,
                });
            }

            return existingUser;
        })
    );

    // Create productions
    const productions = await Promise.all(
        getProductions().map(async (production) => {
            const user = await prisma.user.findUnique({
                where: { email: production.userEmail },
            });

            if (user) {
                return prisma.production.create({
                    data: {
                      productType: production.productType,
                      startTime: production.startTime,
                      quantity: production.quantity,
                      unitPrice: production.unitPrice,
                      endTime: production.endTime,
                      status: production.status,
                      user: { connect: { id: user.id } },
                    },
                });
            }
        })
    );

    // Create finished products
    const finishedProducts = await Promise.all(
        getFinishedProducts().map(async (finishedProduct, index) => {
            const production = productions[index];

            if (!production) {
                console.error(`Production for finished product not found at index ${index}`);
                return null;
            }

            if (production.status === 'IN_PROGRESS') {
                console.warn(`Production with id ${production.id} is IN_PROGRESS and will not be added to finished products`);
                return null;
            }

            const totalCost = production.unitPrice * production.quantity;

            const createdFinishedProduct = await prisma.finishedProduct.create({
                data: {
                    productType: finishedProduct.productType,
                    quantity: finishedProduct.quantity,
                    unitPrice: production.unitPrice,
                    totalCost,
                    productionId: production.id,
                },
            });

            if (finishedProduct.status === 'SOLD') {
                // Update inventory
                await prisma.inventoryData.updateMany({
                    where: {
                        type: finishedProduct.productType,
                    },
                    data: {
                        quantity: {
                            decrement: finishedProduct.quantity,
                        },
                    },
                });

                // Update sales report
                const salesReport = getSalesReports()[index];
                await prisma.salesReport.create({
                    data: {
                      productType: finishedProduct.productType,
                      salesDate: salesReport.salesDate,
                      quantitySold: finishedProduct.quantity,
                      totalRevenue: salesReport.totalRevenue,
                      finishedProduct: {
                          connect: { id: createdFinishedProduct.id },
                      },
                    },
                });
            }

            return createdFinishedProduct;
        })
    );

    // Create initial inventory data
    await Promise.all(
        getInventoryData().map(async (inventory) => {
            return prisma.inventoryData.create({
                data: inventory,
            });
        })
    );
    } catch (error) {
        console.error(error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Mock data functions
function getUsers(): Array<User> {
    return [
        {
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password',
            birthDate: new Date('1990-01-01'),
            address: '123 Main St',
            role: 'ADMIN',
            position: 'Manager',
        },
        {
            name: 'Jane Doe',
            email: 'jane@example.com',
            password: 'password',
            birthDate: new Date('1995-01-01'),
            address: '456 Main St',
            role: 'EMPLOYEE',
            position: 'Sewer',
        },
    ];
}

function getProductions(): Array<Production> {
    return [
        {
            productType: 'Polo',
            startTime: new Date('2022-01-01'),
            status: 'IN_PROGRESS',
            unitPrice: 500,
            quantity: 1,
            userEmail: 'jane@example.com',
        },
        {
            productType: 'Pants',
            startTime: new Date('2022-01-15'),
            endTime: new Date('2022-01-20'),
            status: 'COMPLETED',
            unitPrice: 600,
            quantity: 2,
            userEmail: 'john@example.com',
        },
    ];
}

function getFinishedProducts(): Array<FinishedProduct> {
    return [
        {
            productType: 'Polo',
            status: 'AVAILABLE',
            unitPrice: 500,
            quantity: 10,
        },
        {
            productType: 'Pants',
            status: 'SOLD',
            unitPrice: 600,
            quantity: 20,
        },
    ];
}

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

function getSalesReports(): Array<SalesReport> {
    return [
        {
            producType: 'Polo',
            salesDate: new Date('2022-01-31'),
            quantitySold: 5,
            totalRevenue: 100,
        },
        {
            producType: 'Pants',
            salesDate: new Date('2022-02-28'),
            quantitySold: 10,
            totalRevenue: 200,
        },
    ];
}

seed();