import { Router } from 'express';
import { escalateAlert, getAlerts, getSummary, nudgeAlert } from './deal-health.controller.js';

export const dealHealthRoutes = Router();

dealHealthRoutes.get('/', getSummary);
dealHealthRoutes.get('/alerts', getAlerts);
dealHealthRoutes.post('/:id/escalate', escalateAlert);
dealHealthRoutes.post('/:id/nudge', nudgeAlert);
