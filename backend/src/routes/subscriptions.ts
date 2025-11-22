import { Router } from 'express';
import { getSubscriptions, getSubscription, createSubscription, updateSubscription, deleteSubscription, getRenewals } from '../controllers/subscriptions';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getSubscriptions);
router.get('/renewals', getRenewals);
router.get('/:id', getSubscription);
router.post('/', createSubscription);
router.put('/:id', updateSubscription);
router.delete('/:id', deleteSubscription);

export default router;

