import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { addMonths, addQuarters, addYears } from 'date-fns';

export const getProjects = async (req: Request, res: Response) => {
  try {
    const { status, ownerId, clientId } = req.query;

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (ownerId) {
      where.ownerId = ownerId;
    }
    if (clientId) {
      where.clientId = clientId;
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
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
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { projects }
    });
  } catch (error: any) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        milestones: {
          orderBy: { dueDate: 'asc' }
        },
        appointments: {
          orderBy: { date: 'asc' }
        }
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: { project }
    });
  } catch (error: any) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const { name, description, clientId, ownerId, startDate, targetEndDate, milestones } = req.body;

    if (!name || !clientId || !ownerId || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Name, client, owner, and start date are required'
      });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        clientId,
        ownerId,
        startDate: new Date(startDate),
        targetEndDate: targetEndDate ? new Date(targetEndDate) : null,
        milestones: milestones ? {
          create: milestones.map((m: any) => ({
            name: m.name,
            dueDate: new Date(m.dueDate)
          }))
        } : undefined
      },
      include: {
        client: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        milestones: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project }
    });
  } catch (error: any) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, status, targetEndDate, actualEndDate } = req.body;

    const project = await prisma.project.update({
      where: { id },
      data: {
        name,
        description,
        status,
        targetEndDate: targetEndDate ? new Date(targetEndDate) : undefined,
        actualEndDate: actualEndDate ? new Date(actualEndDate) : undefined
      }
    });

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: { project }
    });
  } catch (error: any) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateProjectProgress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { milestoneIds, latestUpdate } = req.body;

    // Update milestone completions
    if (milestoneIds && Array.isArray(milestoneIds)) {
      await Promise.all(
        milestoneIds.map((milestoneId: string) =>
          prisma.milestone.update({
            where: { id: milestoneId },
            data: {
              isCompleted: true,
              completedAt: new Date()
            }
          })
        )
      );
    }

    // Recalculate percent complete
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        milestones: true
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const totalMilestones = project.milestones.length;
    const completedMilestones = project.milestones.filter(m => m.isCompleted).length;
    const percentComplete = totalMilestones > 0 
      ? Math.round((completedMilestones / totalMilestones) * 100)
      : 0;

    // Determine status
    let status = project.status;
    const now = new Date();
    if (project.targetEndDate && now > project.targetEndDate) {
      if (percentComplete >= 90) {
        status = 'AMBER';
      } else {
        status = 'RED';
      }
    } else if (percentComplete === 100) {
      status = 'COMPLETED';
    } else if (percentComplete >= 75) {
      status = 'GREEN';
    } else if (percentComplete >= 50) {
      status = 'AMBER';
    } else {
      status = 'RED';
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        percentComplete,
        status,
        latestUpdate
      },
      include: {
        milestones: true
      }
    });

    res.json({
      success: true,
      message: 'Project progress updated successfully',
      data: { project: updatedProject }
    });
  } catch (error: any) {
    console.error('Update project progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.project.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

