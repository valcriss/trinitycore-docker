import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.sendFile(__dirname + '../../public/index.html');
});

export default router;
