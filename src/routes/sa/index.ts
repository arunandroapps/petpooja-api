import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import distributorsRouter from './distributors';
import ownersRouter from './owners';
import restaurantsRouter from './restaurants';
import plansRouter from './plans';
import analyticsRouter from './analytics';
import ticketsRouter from './tickets';

const router = Router();
router.use(authenticate, authorize('superadmin'));

router.use('/distributors', distributorsRouter);
router.use('/owners', ownersRouter);
router.use('/restaurants', restaurantsRouter);
router.use('/plans', plansRouter);
router.use('/analytics', analyticsRouter);
router.use('/tickets', ticketsRouter);

export default router;
