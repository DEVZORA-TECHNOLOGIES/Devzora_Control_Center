import { Router } from 'express';
import { getBudgets, createBudget, updateBudget, deleteBudget } from '../controllers/budgets';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getBudgets);
router.post('/', createBudget);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

export default router;
