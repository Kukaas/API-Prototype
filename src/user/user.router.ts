import express from 'express';
import type {  Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

import * as userServer from './user.server';

export const userRouter = express.Router();

//GET all users
userRouter.get('/', async (request: Request, response: Response) => {
    try {
        const users = await userServer.getUsers();
        response.json(users);
    } catch (error) {
        response.status(500).json({ error: 'Error fetching users' });
    }
});

//GET user by ID
userRouter.get('/:id', async (request: Request, response: Response) => {
    try {
        const user = await userServer.getUserById(request.params.id);
        if (!user) {
            response.status(404).json({ error: 'User not found' });
            return;
        }
        response.json(user);
    } catch (error) {
        response.status(500).json({ error: 'Error fetching user by ID' });
    }
});

//CREATE user
userRouter.post(
    '/',
    [
        body('name').isString().notEmpty(),
        body('address').isString().notEmpty(),
        body('birthDate').isDate(),
        body('email').isEmail(),
        body('password').isString().notEmpty(),
        body('role').isString().notEmpty(),
        body('position').optional().isString(),
    ],
    async (request: Request, response: Response) => {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            response.status(400).json({ errors: errors.array() });
            return;
        }

        const { name, email } = request.body;
        const birthDate = new Date(request.body.birthDate).toISOString().split('T')[0];

        // Check if a user with the same email or name already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { name },
                ],
            },
        });

        if (existingUser) {
            response.status(400).json({ error: 'Email or name already in use' });
            return;
        }

        try {
            const user = await userServer.createUser({ ...request.body, birthDate });
            response.status(201).json({ user, message: 'User created successfully' });
        } catch (error) {
            response.status(500).json({ error: 'Error creating user' });
        }
    }
);

//UPDATE user
userRouter.put(
    '/:id',
    [
        body('name').optional().isString(),
        body('address').isString().notEmpty(),
        body('birthDate').isDate(),
        body('email').optional().isEmail(),
        body('password').optional().isString(),
        body('role').optional().isString(),
        body('position').optional().isString(),
    ],
    async (request: Request, response: Response) => {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            response.status(400).json({ errors: errors.array() });
            return;
        }

        const { id } = request.params;
        const { name, email } = request.body;
        const birthDate = new Date(request.body.birthDate).toISOString().split('T')[0];

        // Check if a user with the same email or name already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { name },
                ],
            },
        });

        if (existingUser && existingUser.id !== id) {
            response.status(400).json({ error: 'Email or name already in use' });
            return;
        }

        try {
            const user = await userServer.updateUser(id, { ...request.body, birthDate });
            response.json({ user, message: 'User updated successfully' });
        } catch (error) {
            response.status(500).json({ error: 'Error updating user' });
        }
    }
);

//DELETE user
userRouter.delete('/:id', async (request: Request, response: Response) => {
    try {
        const user = await userServer.deleteUser(request.params.id);
        if (!user) {
            response.status(404).json({ error: 'User not found' });
            return;
        }
        response.json({ user, message: 'User deleted successfully' });
    } catch (error) {
        response.status(500).json({ error: 'Error deleting user' });
    }
});
