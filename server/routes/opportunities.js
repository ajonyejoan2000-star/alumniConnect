const express = require('express');
const protect = require('../middleware/protect');
const {
  createOpportunity,
  getOpportunities,
  getOpportunity,
  applyOpportunity,
  saveOpportunity,
  getSavedOpportunities,
  updateApplicationStatus
} = require('../controllers/opportunities');

const router = express.Router();

router.post('/create', protect, createOpportunity);
router.get('/', getOpportunities);
router.get('/saved', protect, getSavedOpportunities);
router.get('/:id', getOpportunity);
router.post('/:id/apply', protect, applyOpportunity);
router.post('/:id/save', protect, saveOpportunity);
router.patch('/:id/applicant/:applicantId', protect, updateApplicationStatus);

module.exports = router;
