import { prisma } from '../src/utils/db.server';

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
};

type FinishedProduct = {
  productType: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  productionId?: string;
};

type InventoryData = {
  type: string;
  quantity: number;
};

type SalesReport = {
  salesDate: Date;
  quantitySold: number;
  totalRevenue: number;
  finishedProductId?: string;
};

async function seed() {
  // Create users
  const users = await Promise.all(
    getUsers().map(async (user) => {
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

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
        console.error(`Production with id ${finishedProduct.productionId} not found`);
        return;
      }

      return prisma.finishedProduct.create({
        data: {
          productType: finishedProduct.productType,
          quantity: finishedProduct.quantity,
          unitPrice: finishedProduct.unitPrice,
          totalCost: finishedProduct.totalCost,
          productionId: production.id,
          inventoryData: {
            create: {
              type: finishedProduct.productType,
              quantity: finishedProduct.quantity,
            },
          },
        },
      });
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
      });
    })
  );

  // Create sales reports
  await Promise.all(
    getSalesReports().map(async (salesReport, index) => {
      const finishedProduct = finishedProducts[index];

      if (!finishedProduct) {
        console.error(`FinishedProductId is not set for salesReport with id ${salesReport.finishedProductId}`);
        return;
      }

      return prisma.salesReport.create({
        data: {
          salesDate: salesReport.salesDate,
          quantitySold: salesReport.quantitySold,
          totalRevenue: salesReport.totalRevenue,
          finishedProduct: {
            connect: { id: finishedProduct.id },
          },
        },
      });
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

// Mock data functions
function getUsers(): Array<User> {
  return [
    {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password',
      role: 'ADMIN',
      position: 'Manager',
    },
    {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password',
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
      userEmail: 'jane@example.com',
    },
    {
      productType: 'Pants',
      startTime: new Date('2022-01-15'),
      endTime: new Date('2022-01-20'),
      status: 'COMPLETED',
      userEmail: 'john@example.com',
    },
  ];
}

function getFinishedProducts(): Array<FinishedProduct> {
  return [
    {
      productType: 'Polo',
      quantity: 10,
      unitPrice: 20,
      totalCost: 200,
      // Assuming the first production corresponds to this finished product
      productionId: '', // Placeholder, will be set in the seed function
    },
    {
      productType: 'Pants',
      quantity: 20,
      unitPrice: 30,
      totalCost: 600,
      // Assuming the second production corresponds to this finished product
      productionId: '', // Placeholder, will be set in the seed function
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
      salesDate: new Date('2022-01-31'),
      quantitySold: 5,
      totalRevenue: 100,
      finishedProductId: '', // Placeholder, will be set in the seed function
    },
    {
      salesDate: new Date('2022-02-28'),
      quantitySold: 10,
      totalRevenue: 200,
      finishedProductId: '', // Placeholder, will be set in the seed function
    },
  ];
}
