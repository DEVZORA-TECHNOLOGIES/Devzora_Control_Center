import { Router } from 'express';
import { getProjects, getProject, createProject, updateProject, deleteProject, updateProjectProgress } from '../controllers/projects';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/', createProject);
router.put('/:id', updateProject);
router.patch('/:id/progress', updateProjectProgress);
router.delete('/:id', deleteProject);

export default router;

