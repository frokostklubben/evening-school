import Router from 'express';
const router = Router();
import User from '../database/models/user.js';

router.get('/api/users', async (req, res) => {
  const users = await User.findAll();
  console.log(users);
  res.send({ data: users });
});

router.post('/api/users', async (req, res) => {
  const { user_name } = req.body;
  const user = await User.create({ user_name: user_name });
  console.log(user.user_name + ' ' + user.id);
  res.status(200).send({ data: user });
});

export default router;
