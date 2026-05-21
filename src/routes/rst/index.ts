import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import menuRouter from './menu';
import ordersRouter from './orders';
import tablesRouter from './tables';
import customersRouter from './customers';
import inventoryRouter from './inventory';
import staffRouter from './staff';
import reportsRouter from './reports';

const router = Router();
router.use(authenticate, authorize('restaurant'));

router.use('/menu', menuRouter);
router.use('/orders', ordersRouter);
router.use('/tables', tablesRouter);
router.use('/customers', customersRouter);
router.use('/inventory', inventoryRouter);
router.use('/staff', staffRouter);
router.use('/reports', reportsRouter);

export default router;
