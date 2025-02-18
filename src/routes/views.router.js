import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
	res.render('index'), { title: 'Bienvenido a la aplicación de chat Farias' };
});

export default router;
