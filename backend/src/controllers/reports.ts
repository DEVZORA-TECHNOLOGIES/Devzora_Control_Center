import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { startOfMonth, endOfMonth, addMonths, startOfDay, endOfDay } from 'date-fns';

export const getRevenueReport = async (req: Request, res: Response) => {
  try {
    // Calculate current MRR
    const activeSubscriptions = await prisma.subscription.findMany({
      where: { isActive: true }
    });

    let mrr = 0;
    activeSubscriptions.forEach(sub => {
      const amount = parseFloat(sub.amount.toString());
      switch (sub.billingCycle) {
        case 'MONTHLY':
          mrr += amount;
          break;
        case 'QUARTERLY':
          mrr += amount / 3;
          break;
        case 'ANNUAL':
          mrr += amount / 12;
          break;
      }
    });

    // Upcoming renewals per month (next 12 months)
    const renewalsByMonth = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const monthStart = startOfMonth(addMonths(now, i));
      const monthEnd = endOfMonth(addMonths(now, i));

      const subscriptions = await prisma.subscription.findMany({
        where: {
          isActive: true,
          nextInvoiceDate: {
            gte: startOfDay(monthStart),
            lte: endOfDay(monthEnd)
          }
        }
      });

      const totalAmount = subscriptions.reduce((sum, sub) => {
        return sum + parseFloat(sub.amount.toString());
      }, 0);

      renewalsByMonth.push({
        month: monthStart.toLocaleString('default', { month: 'long', year: 'numeric' }),
        monthShort: monthStart.toLocaleString('default', { month: 'short', year: 'numeric' }),
        count: subscriptions.length,
        totalAmount
      });
    }

    // MRR over time (last 6 months - simplified)
    const mrrOverTime = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      mrrOverTime.push({
        month: monthDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
        mrr: mrr // In production, calculate historical MRR from invoices
      });
    }

    res.json({
      success: true,
      data: {
        currentMRR: mrr,
        arr: mrr * 12,
        renewalsByMonth,
        mrrOverTime
      }
    });
  } catch (error: any) {
    console.error('Get revenue report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getProjectsStatusReport = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        },
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            milestones: true
          }
        }
      }
    });

    const statusCounts = {
      GREEN: 0,
      AMBER: 0,
      RED: 0,
      ON_HOLD: 0,
      COMPLETED: 0
    };

    projects.forEach(project => {
      statusCounts[project.status as keyof typeof statusCounts]++;
    });

    const projectsByStatus = {
      GREEN: projects.filter(p => p.status === 'GREEN'),
      AMBER: projects.filter(p => p.status === 'AMBER'),
      RED: projects.filter(p => p.status === 'RED'),
      ON_HOLD: projects.filter(p => p.status === 'ON_HOLD'),
      COMPLETED: projects.filter(p => p.status === 'COMPLETED')
    };

    res.json({
      success: true,
      data: {
        statusCounts,
        projectsByStatus,
        total: projects.length
      }
    });
  } catch (error: any) {
    console.error('Get projects status report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getOverdueReport = async (req: Request, res: Response) => {
  try {
    const now = new Date();

    // Overdue invoices
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        status: {
          in: ['SENT', 'OVERDUE']
        },
        dueDate: {
          lt: now
        }
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        subscription: {
          select: {
            id: true,
            productName: true
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    const overdueInvoicesWithDays = overdueInvoices.map(invoice => {
      const daysOverdue = Math.floor((now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      return {
        ...invoice,
        daysOverdue
      };
    });

    // Overdue milestones
    const overdueMilestones = await prisma.milestone.findMany({
      where: {
        isCompleted: false,
        dueDate: {
          lt: now
        }
      },
      include: {
        project: {
          include: {
            client: {
              select: {
                id: true,
                name: true
              }
            },
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    const overdueMilestonesWithDays = overdueMilestones.map(milestone => {
      const daysOverdue = Math.floor((now.getTime() - milestone.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      return {
        ...milestone,
        daysOverdue
      };
    });

    res.json({
      success: true,
      data: {
        overdueInvoices: overdueInvoicesWithDays,
        overdueMilestones: overdueMilestonesWithDays,
        summary: {
          totalOverdueInvoices: overdueInvoices.length,
          totalOverdueAmount: overdueInvoices.reduce((sum, inv) => {
            return sum + parseFloat(inv.total.toString());
          }, 0),
          totalOverdueMilestones: overdueMilestones.length
        }
      }
    });
  } catch (error: any) {
    console.error('Get overdue report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

