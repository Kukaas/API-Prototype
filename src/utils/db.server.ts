import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

declare global {
    var prisma: PrismaClient;
}

if (!global.prisma) {
    global.prisma = new PrismaClient();
}

prisma = global.prisma;

export {prisma};