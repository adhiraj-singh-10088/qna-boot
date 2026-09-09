import express from 'express';
import { signup, login } from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.get('/me', authMiddleware, (req, res) => {
	return res.json({ user: req.user });
});

export default router;
