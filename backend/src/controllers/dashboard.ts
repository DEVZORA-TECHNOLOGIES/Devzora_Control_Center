import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, addDays } from 'date-fns';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const weekEndDate = endOfDay(weekEnd);

    // Active clients
    const activeClients = await prisma.client.count({
      where: { isActive: true }
    });

    // Active projects
    const activeProjects = await prisma.project.count({
      where: {
        status: {
          not: 'COMPLETED'
        }
      }
    });

    // Calculate MRR (Monthly Recurring Revenue)
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

    // Overdue invoices
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        status: 'OVERDUE',
        dueDate: {
          lt: now
        }
      },
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    const overdueAmount = overdueInvoices.reduce((sum, inv) => {
      return sum + parseFloat(inv.total.toString());
    }, 0);

    // Today's appointments
    const todayAppointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: todayStart,
          lte: todayEnd
        }
      },
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        },
        project: {
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
      },
      orderBy: { date: 'asc' }
    });

    // Renewals due today/this week
    const renewalsToday = await prisma.subscription.findMany({
      where: {
        isActive: true,
        nextInvoiceDate: {
          gte: todayStart,
          lte: todayEnd
        }
      },
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    const renewalsThisWeek = await prisma.subscription.findMany({
      where: {
        isActive: true,
        nextInvoiceDate: {
          gte: weekStart,
          lte: weekEndDate
        }
      },
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Projects that changed status (recently updated)
    const recentProjects = await prisma.project.findMany({
      where: {
        updatedAt: {
          gte: addDays(now, -7)
        }
      },
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
      },
      orderBy: { updatedAt: 'desc' },
      take: 10
    });

    // Money - MRR graph data (last 6 months)
    const mrrData = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      mrrData.push({
        month: monthDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
        mrr: mrr // Simplified - in production, calculate historical MRR
      });
    }

    // Unpaid & overdue invoices
    const unpaidInvoices = await prisma.invoice.findMany({
      where: {
        status: {
          in: ['DRAFT', 'SENT', 'OVERDUE']
        }
      },
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    // Projects with status
    const projectsByStatus = await prisma.project.findMany({
      where: {
        status: {
          not: 'COMPLETED'
        }
      },
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
      },
      orderBy: [
        { status: 'asc' },
        { targetEndDate: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: {
        stats: {
          activeClients,
          activeProjects,
          mrr,
          overdueInvoices: overdueInvoices.length,
          overdueAmount
        },
        today: {
          appointments: todayAppointments,
          renewals: renewalsToday
        },
        thisWeek: {
          renewals: renewalsThisWeek
        },
        recentProjects,
        money: {
          mrrData,
          unpaidInvoices
        },
        projects: projectsByStatus
      }
    });
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

