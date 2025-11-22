import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getClients = async (req: Request, res: Response) => {
  try {
    const { search, isActive } = req.query;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const clients = await prisma.client.findMany({
      where,
      include: {
        _count: {
          select: {
            projects: true,
            subscriptions: true,
            invoices: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { clients }
    });
  } catch (error: any) {
    console.error('Get clients error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        projects: {
          include: {
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
          orderBy: { createdAt: 'desc' }
        },
        subscriptions: {
          where: { isActive: true },
          orderBy: { nextInvoiceDate: 'asc' }
        },
        invoices: {
          include: {
            subscription: true,
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        appointments: {
          include: {
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
        }
      }
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      data: { client }
    });
  } catch (error: any) {
    console.error('Get client error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const createClient = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, industry, address, city, country, notes } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Client name is required'
      });
    }

    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        industry,
        address,
        city,
        country,
        notes
      }
    });

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: { client }
    });
  } catch (error: any) {
    console.error('Create client error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, industry, address, city, country, notes, isActive } = req.body;

    const client = await prisma.client.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        industry,
        address,
        city,
        country,
        notes,
        isActive
      }
    });

    res.json({
      success: true,
      message: 'Client updated successfully',
      data: { client }
    });
  } catch (error: any) {
    console.error('Update client error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.client.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete client error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

