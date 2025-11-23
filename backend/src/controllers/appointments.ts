import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns';
import { AuthRequest } from '../middleware/auth';

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const { clientId, projectId, ownerId, startDate, endDate } = req.query;

    const where: any = {};
    if (clientId) {
      where.clientId = clientId;
    }
    if (projectId) {
      where.projectId = projectId;
    }
    if (ownerId) {
      where.ownerId = ownerId;
    }
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = startOfDay(new Date(startDate as string));
      }
      if (endDate) {
        where.date.lte = endOfDay(new Date(endDate as string));
      }
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
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
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { date: 'asc' }
    });

    res.json({
      success: true,
      data: { appointments }
    });
  } catch (error: any) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getMyWeek = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Sunday

    const appointments = await prisma.appointment.findMany({
      where: {
        ownerId: req.user!.id,
        date: {
          gte: startOfDay(weekStart),
          lte: endOfDay(weekEnd)
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
        project: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { date: 'asc' }
    });

    res.json({
      success: true,
      data: { appointments }
    });
  } catch (error: any) {
    console.error('Get my week error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        client: true,
        project: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      data: { appointment }
    });
  } catch (error: any) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, date, location, clientId, projectId, ownerId } = req.body;

    if (!title || !date) {
      return res.status(400).json({
        success: false,
        message: 'Title and date are required'
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        clientId,
        projectId,
        ownerId: ownerId || req.user!.id
      },
      include: {
        client: true,
        project: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: { appointment }
    });
  } catch (error: any) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, date, location, clientId, projectId, ownerId } = req.body;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        title,
        description,
        date: date ? new Date(date) : undefined,
        location,
        clientId,
        projectId,
        ownerId
      },
      include: {
        client: true,
        project: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: { appointment }
    });
  } catch (error: any) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.appointment.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


