import { Router } from 'express';
import { getRevenueReport, getProjectsStatusReport, getOverdueReport } from '../controllers/reports';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/revenue', getRevenueReport);
router.get('/projects', getProjectsStatusReport);
router.get('/overdue', getOverdueReport);

export default router;

