import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getBudgets = async (req: Request, res: Response) => {
    try {
        const { projectId, category } = req.query;

        const where: any = {};
        if (projectId) where.projectId = projectId as string;
        if (category) where.category = category as string;

        const budgets = await prisma.budget.findMany({
            where,
            include: {
                project: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                items: {
                    orderBy: { date: 'desc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: { budgets }
        });
    } catch (error: any) {
        console.error('Get budgets error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getBudget = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const budget = await prisma.budget.findUnique({
            where: { id },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                items: {
                    orderBy: { date: 'desc' }
                }
            }
        });

        if (!budget) {
            return res.status(404).json({
                success: false,
                message: 'Budget not found'
            });
        }

        res.json({
            success: true,
            data: { budget }
        });
    } catch (error: any) {
        console.error('Get budget error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const createBudget = async (req: Request, res: Response) => {
    try {
        const { name, amount, category, startDate, endDate, projectId } = req.body;

        if (!name || !amount || !category || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const budget = await prisma.budget.create({
            data: {
                name,
                amount,
                category,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                projectId: projectId && projectId.trim() !== '' ? projectId : null
            }
        });

        res.status(201).json({
            success: true,
            message: 'Budget created successfully',
            data: { budget }
        });
    } catch (error: any) {
        console.error('Create budget error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const updateBudget = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, amount, spent, category, startDate, endDate, status } = req.body;

        const budget = await prisma.budget.update({
            where: { id },
            data: {
                name,
                amount,
                spent,
                category,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                status
            },
            include: {
                items: true
            }
        });

        res.json({
            success: true,
            message: 'Budget updated successfully',
            data: { budget }
        });
    } catch (error: any) {
        console.error('Update budget error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const deleteBudget = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.budget.delete({
            where: { id }
        });

        res.json({
            success: true,
            message: 'Budget deleted successfully'
        });
    } catch (error: any) {
        console.error('Delete budget error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Budget Items
export const createBudgetItem = async (req: Request, res: Response) => {
    try {
        const { budgetId } = req.params;
        const { name, amount, date } = req.body;

        if (!name || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const item = await prisma.budgetItem.create({
            data: {
                name,
                amount,
                date: date ? new Date(date) : new Date(),
                budgetId
            }
        });

        // Update budget spent amount
        const budget = await prisma.budget.findUnique({
            where: { id: budgetId },
            include: { items: true }
        });

        if (budget) {
            const totalSpent = budget.items.reduce((sum, item) => sum + Number(item.amount), 0);
            await prisma.budget.update({
                where: { id: budgetId },
                data: { spent: totalSpent }
            });
        }

        res.status(201).json({
            success: true,
            message: 'Budget item created successfully',
            data: { item }
        });
    } catch (error: any) {
        console.error('Create budget item error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const updateBudgetItem = async (req: Request, res: Response) => {
    try {
        const { budgetId, itemId } = req.params;
        const { name, amount, date } = req.body;

        const item = await prisma.budgetItem.update({
            where: { id: itemId },
            data: {
                name,
                amount,
                date: date ? new Date(date) : undefined
            }
        });

        // Recalculate budget spent amount
        const budget = await prisma.budget.findUnique({
            where: { id: budgetId },
            include: { items: true }
        });

        if (budget) {
            const totalSpent = budget.items.reduce((sum, item) => sum + Number(item.amount), 0);
            await prisma.budget.update({
                where: { id: budgetId },
                data: { spent: totalSpent }
            });
        }

        res.json({
            success: true,
            message: 'Budget item updated successfully',
            data: { item }
        });
    } catch (error: any) {
        console.error('Update budget item error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const deleteBudgetItem = async (req: Request, res: Response) => {
    try {
        const { budgetId, itemId } = req.params;

        await prisma.budgetItem.delete({
            where: { id: itemId }
        });

        // Recalculate budget spent amount
        const budget = await prisma.budget.findUnique({
            where: { id: budgetId },
            include: { items: true }
        });

        if (budget) {
            const totalSpent = budget.items.reduce((sum, item) => sum + Number(item.amount), 0);
            await prisma.budget.update({
                where: { id: budgetId },
                data: { spent: totalSpent }
            });
        }

        res.json({
            success: true,
            message: 'Budget item deleted successfully'
        });
    } catch (error: any) {
        console.error('Delete budget item error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
