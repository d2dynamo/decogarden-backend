import Router from 'express';
import helloController from '../controllers/hello/get';

const router = Router();

router.get('/', helloController);

export default router;
