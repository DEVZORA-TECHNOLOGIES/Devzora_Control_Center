import { Router } from 'express';
import { getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, generateInvoiceFromSubscription, markInvoicePaid } from '../controllers/invoices';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getInvoices);
router.get('/:id', getInvoice);
router.post('/', createInvoice);
router.post('/from-subscription/:subscriptionId', generateInvoiceFromSubscription);
router.put('/:id', updateInvoice);
router.patch('/:id/paid', markInvoicePaid);
router.delete('/:id', deleteInvoice);

export default router;


