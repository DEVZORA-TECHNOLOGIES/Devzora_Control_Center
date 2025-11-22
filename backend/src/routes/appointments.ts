import { Router } from 'express';
import { getAppointments, getAppointment, createAppointment, updateAppointment, deleteAppointment, getMyWeek } from '../controllers/appointments';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getAppointments);
router.get('/my-week', getMyWeek);
router.get('/:id', getAppointment);
router.post('/', createAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

export default router;

