import express, { Router, Request, Response } from 'express';
import configuration from '../models/configuration/AppConfiguration';

const router = Router();

// Route pour authentifier un utilisateur
router.post('/authenticate', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const accessUsername = configuration.getAccessUsername();
  const accessPassword = configuration.getAccessPassword();

  if (username === accessUsername && password === accessPassword) {
      res.status(200).json({ success: true });
  } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Route pour vérifier si l'authentification est nécessaire
router.get('/needAuthentication', (req: Request, res: Response) => {
  const accessUsername = configuration.getAccessUsername();
  const accessPassword = configuration.getAccessPassword();

  const needAuthentication = !!(accessUsername && accessPassword);
  res.status(200).json({ needAuthentication });
});

export default router;