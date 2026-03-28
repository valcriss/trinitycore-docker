import path from 'path';
import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

export default router;
