import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { addMonths, addQuarters, addYears } from 'date-fns';
import { AuthRequest } from '../middleware/auth';

const generateInvoiceNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count({
    where: {
      invoiceNumber: {
        startsWith: `INV-${year}`
      }
    }
  });
  return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
};

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

export const getInvoices = async (req: Request, res: Response) => {
  try {
    const { status, clientId, overdue } = req.query;

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (clientId) {
      where.clientId = clientId;
    }
    if (overdue === 'true') {
      where.status = 'OVERDUE';
      where.dueDate = {
        lt: new Date()
      };
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        subscription: {
          select: {
            id: true,
            productName: true,
            plan: true
          }
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        items: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { invoices }
    });
  } catch (error: any) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        subscription: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        items: true
      }
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      data: { invoice }
    });
  } catch (error: any) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const createInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { clientId, subscriptionId, issueDate, dueDate, items, tax, notes } = req.body;

    if (!clientId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Client and at least one item are required'
      });
    }

    const subtotal = items.reduce((sum: number, item: any) => {
      return sum + parseFloat(item.amount || 0);
    }, 0);

    const taxAmount = tax || 0;
    const total = subtotal + taxAmount;

    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        clientId,
        subscriptionId,
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : new Date(),
        subtotal,
        tax: taxAmount,
        total,
        notes,
        createdById: req.user!.id,
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: parseFloat(item.quantity || 1),
            rate: parseFloat(item.rate || 0),
            amount: parseFloat(item.amount || 0)
          }))
        }
      },
      include: {
        client: true,
        subscription: true,
        items: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: { invoice }
    });
  } catch (error: any) {
    console.error('Create invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const generateInvoiceFromSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { subscriptionId } = req.params;
    const { issueDate, dueDate, discount, tax, notes } = req.body;

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        client: true
      }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    const amount = parseFloat(subscription.amount.toString());
    const discountAmount = discount || 0;
    const subtotal = amount - discountAmount;
    const taxAmount = tax || 0;
    const total = subtotal + taxAmount;

    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        clientId: subscription.clientId,
        subscriptionId: subscription.id,
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : subscription.nextInvoiceDate,
        subtotal,
        tax: taxAmount,
        total,
        notes: notes || `Invoice for ${subscription.productName} - ${subscription.plan}`,
        createdById: req.user!.id,
        items: {
          create: {
            description: `${subscription.productName} - ${subscription.plan}`,
            quantity: 1,
            rate: amount,
            amount: subtotal
          }
        }
      },
      include: {
        client: true,
        subscription: true,
        items: true
      }
    });

    // Update subscription's next invoice date
    const nextInvoiceDate = calculateNextInvoiceDate(subscription.nextInvoiceDate, subscription.billingCycle);
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { nextInvoiceDate }
    });

    res.status(201).json({
      success: true,
      message: 'Invoice generated from subscription successfully',
      data: { invoice }
    });
  } catch (error: any) {
    console.error('Generate invoice from subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, issueDate, dueDate, items, tax, notes } = req.body;

    // If items are updated, recalculate totals
    let updateData: any = {
      status,
      issueDate: issueDate ? new Date(issueDate) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      tax,
      notes
    };

    if (items && Array.isArray(items)) {
      const subtotal = items.reduce((sum: number, item: any) => {
        return sum + parseFloat(item.amount || 0);
      }, 0);
      const taxAmount = tax || 0;
      updateData.subtotal = subtotal;
      updateData.total = subtotal + taxAmount;

      // Delete existing items and create new ones
      await prisma.invoiceItem.deleteMany({
        where: { invoiceId: id }
      });

      await prisma.invoiceItem.createMany({
        data: items.map((item: any) => ({
          invoiceId: id,
          description: item.description,
          quantity: parseFloat(item.quantity || 1),
          rate: parseFloat(item.rate || 0),
          amount: parseFloat(item.amount || 0)
        }))
      });
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        subscription: true,
        items: true
      }
    });

    res.json({
      success: true,
      message: 'Invoice updated successfully',
      data: { invoice }
    });
  } catch (error: any) {
    console.error('Update invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const markInvoicePaid = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        status: 'PAID'
      }
    });

    res.json({
      success: true,
      message: 'Invoice marked as paid',
      data: { invoice }
    });
  } catch (error: any) {
    console.error('Mark invoice paid error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.invoice.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

