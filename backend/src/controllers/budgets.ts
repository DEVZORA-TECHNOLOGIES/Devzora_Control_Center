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
