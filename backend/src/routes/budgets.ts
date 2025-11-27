import { Router } from 'express';
import {
    getBudgets,
    getBudget,
    createBudget,
    updateBudget,
    deleteBudget,
    createBudgetItem,
    updateBudgetItem,
    deleteBudgetItem
} from '../controllers/budgets';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getBudgets);
router.get('/:id', getBudget);
router.post('/', createBudget);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

// Budget Items
router.post('/:budgetId/items', createBudgetItem);
router.put('/:budgetId/items/:itemId', updateBudgetItem);
router.delete('/:budgetId/items/:itemId', deleteBudgetItem);

export default router;
