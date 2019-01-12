import { Router, Request, Response } from 'express';

const router: Router = Router();

router.get('/test', (req: Request, res: Response) => {
    res.send('Hello world');
});

export const TestingController: Router = router;
