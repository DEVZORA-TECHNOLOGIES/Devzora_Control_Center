import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { addMonths, addQuarters, addYears, startOfDay, endOfDay } from 'date-fns';

const calculateNextInvoiceDate = (startDate: Date, billingCycle: string): Date => {
  const date = new Date(startDate);
  switch (billingCycle) {
    case 'MONTHLY':
      return addMonths(date, 1);
    case 'QUARTERLY':
      return addQuarters(date, 1);
    case 'ANNUAL':
      return addYears(date, 1);
    default:
      return addMonths(date, 1);
  }
};

export const getSubscriptions = async (req: Request, res: Response) => {
  try {
    const { clientId, isActive } = req.query;

    const where: any = {};
    if (clientId) {
      where.clientId = clientId;
    }
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const subscriptions = await prisma.subscription.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            invoices: true
          }
        }
      },
      orderBy: { nextInvoiceDate: 'asc' }
    });

    res.json({
      success: true,
      data: { subscriptions }
    });
  } catch (error: any) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getRenewals = async (req: Request, res: Response) => {
  try {
    const { period } = req.query; // 'week', 'month', '3months'

    const now = new Date();
    let endDate: Date;

    switch (period) {
      case 'week':
        endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        endDate = addMonths(now, 1);
        break;
      case '3months':
        endDate = addMonths(now, 3);
        break;
      default:
        endDate = addMonths(now, 1);
    }

    const subscriptions = await prisma.subscription.findMany({
      where: {
        isActive: true,
        nextInvoiceDate: {
          gte: startOfDay(now),
          lte: endOfDay(endDate)
        }
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        invoices: {
          where: {
            status: {
              in: ['DRAFT', 'SENT', 'PAID']
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { nextInvoiceDate: 'asc' }
    });

    const renewals = subscriptions.map(sub => ({
      ...sub,
      invoiceStatus: sub.invoices[0]?.status || 'NOT_INVOICED'
    }));

    res.json({
      success: true,
      data: { renewals }
    });
  } catch (error: any) {
    console.error('Get renewals error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        client: true,
        invoices: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    res.json({
      success: true,
      data: { subscription }
    });
  } catch (error: any) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const createSubscription = async (req: Request, res: Response) => {
  try {
    const { productName, plan, amount, billingCycle, startDate, clientId } = req.body;

    if (!productName || !amount || !billingCycle || !startDate || !clientId) {
      return res.status(400).json({
        success: false,
        message: 'Product name, amount, billing cycle, start date, and client are required'
      });
    }

    const start = new Date(startDate);
    const nextInvoiceDate = calculateNextInvoiceDate(start, billingCycle);

    const subscription = await prisma.subscription.create({
      data: {
        productName,
        plan,
        amount: parseFloat(amount),
        billingCycle,
        startDate: start,
        nextInvoiceDate,
        clientId
      },
      include: {
        client: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: { subscription }
    });
  } catch (error: any) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { productName, plan, amount, billingCycle, isActive } = req.body;

    const subscription = await prisma.subscription.update({
      where: { id },
      data: {
        productName,
        plan,
        amount: amount ? parseFloat(amount) : undefined,
        billingCycle,
        isActive
      }
    });

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      data: { subscription }
    });
  } catch (error: any) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.subscription.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Subscription deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


