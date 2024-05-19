import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

const serverless = require("serverless-http");

import { userRouter } from './functions/user/user.router';
import { productionRouter } from './functions/production/production.router';
import { inventoryRouter } from './functions/inventory/inventory.router';
import { finishedProductRouter } from './functions/finishedProduct/finishedProduct.router';
import { salesReportRouter } from './functions/salesReport/salesReport.router';

dotenv.config();

if(!process.env.PORT) {
    process.exit(1);
}

const PORT: number = parseInt(process.env.PORT as string, 10);

const app = express();

app.use(express.json());
app.use(cors());
app.use('/api/user', userRouter)
app.use('/api/production', productionRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/finished-product', finishedProductRouter);
app.use('/api/sales-report', salesReportRouter);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

module.exports.handler = serverless(app);