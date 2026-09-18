const express = require('express');
const {
  getClients,
  getInsights,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} = require('../controllers/clientController');
const { protect } = require('../middleware/auth');
const {
  validate,
  clientRules,
  clientUpdateRules,
  idParamRule,
  listQueryRules,
} = require('../utils/validators');

const router = express.Router();

router.use(protect); // everything below requires a logged-in advisor

router.get('/insights', getInsights); // before /:id so "insights" isn't read as an id
router.get('/', listQueryRules, validate, getClients);
router.post('/', clientRules, validate, createClient);
router.get('/:id', idParamRule, validate, getClientById);
router.put('/:id', idParamRule, clientUpdateRules, validate, updateClient);
router.delete('/:id', idParamRule, validate, deleteClient);

module.exports = router;
