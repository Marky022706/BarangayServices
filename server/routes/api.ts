import { Router } from 'express';
import { login, logout, getMe } from '../controllers/authController';
import { getServices, getServiceById } from '../controllers/servicesController';
import { 
  createApplication, 
  getApplications, 
  getApplicationById, 
  trackApplication 
} from '../controllers/applicationsController';
import { 
  approveApplication, 
  rejectApplication, 
  moveToVerification, 
  markReadyForClaiming,
  markClaimed
} from '../controllers/staffController';
import { 
  getDashboardStatistics, 
  getApplicationHistory 
} from '../controllers/dashboardController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// ── 1. Authentication Endpoints ──────────────────────────────────────────────
router.post('/auth/login', login);
router.post('/auth/logout', logout);
router.get('/auth/me', authenticate, getMe);

// ── 2. Barangay Services ─────────────────────────────────────────────────────
router.get('/services', getServices);
router.get('/services/:id', getServiceById);

// ── 3. Resident Applications ─────────────────────────────────────────────────
router.post('/applications', createApplication);
router.get('/applications', getApplications);
router.get('/applications/track/:referenceNumber', trackApplication);
router.get('/applications/:id', getApplicationById);
router.get('/applications/:id/history', getApplicationHistory);

// ── 4. Staff Application Processing (RBAC Protected) ─────────────────────────
router.get('/staff/applications', authenticate, requireRole(['admin', 'staff']), getApplications);
router.patch('/staff/applications/:id/approve', authenticate, requireRole(['admin', 'staff']), approveApplication);
router.patch('/staff/applications/:id/reject', authenticate, requireRole(['admin', 'staff']), rejectApplication);
router.patch('/staff/applications/:id/verify', authenticate, requireRole(['admin', 'staff']), moveToVerification);
router.patch('/staff/applications/:id/ready', authenticate, requireRole(['admin', 'staff']), markReadyForClaiming);
router.patch('/staff/applications/:id/claim', authenticate, requireRole(['admin', 'staff']), markClaimed);

// ── 5. Dashboard Statistics ──────────────────────────────────────────────────
router.get('/dashboard/statistics', getDashboardStatistics);

export default router;
