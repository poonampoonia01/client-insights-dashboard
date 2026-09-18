const Client = require('../models/Client');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/clients?search=&category=&sortBy=&order=&page=&limit=
// Search, filter and sort all live on the same endpoint since an advisor
// applies them together (e.g. "UHNI clients named Rao, richest first").
const getClients = asyncHandler(async (req, res) => {
  const {
    search = '',
    category = 'All',
    sortBy = 'onboardingDate',
    order = 'desc',
    page = 1,
    limit = 20,
  } = req.query;

  const filter = { advisor: req.advisor._id };

  if (search.trim()) {
    // Case-insensitive partial match on name, not just exact/prefix,
    // so "rao" finds "Aditi Rao" the way an advisor expects.
    filter.name = { $regex: search.trim(), $options: 'i' };
  }

  if (category && category !== 'All') {
    filter.category = category;
  }

  const sortField = ['netWorth', 'name', 'onboardingDate'].includes(sortBy)
    ? sortBy
    : 'onboardingDate';
  const sortDir = order === 'asc' ? 1 : -1;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

  const [clients, total] = await Promise.all([
    Client.find(filter)
      .sort({ [sortField]: sortDir, _id: 1 })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize),
    Client.countDocuments(filter),
  ]);

  res.json({
    clients,
    pagination: {
      total,
      page: pageNum,
      limit: pageSize,
      totalPages: Math.max(Math.ceil(total / pageSize), 1),
    },
  });
});

// GET /api/clients/insights
// Registered before /:id in the router so "insights" is never parsed as an id.
const getInsights = asyncHandler(async (req, res) => {
  const advisorId = req.advisor._id;

  const [summary] = await Client.aggregate([
    { $match: { advisor: advisorId } },
    {
      $facet: {
        totals: [
          {
            $group: {
              _id: null,
              totalClients: { $sum: 1 },
              aggregateNetWorth: { $sum: '$netWorth' },
              averageNetWorth: { $avg: '$netWorth' },
            },
          },
        ],
        byCategory: [{ $group: { _id: '$category', count: { $sum: 1 } } }],
        byAssetClass: [
          { $group: { _id: '$primaryAssetClass', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
      },
    },
  ]);

  const totals = summary.totals[0] || {
    totalClients: 0,
    aggregateNetWorth: 0,
    averageNetWorth: 0,
  };

  const categoryDistribution = { HNI: 0, UHNI: 0 };
  summary.byCategory.forEach((c) => {
    if (c._id) categoryDistribution[c._id] = c.count;
  });

  const assetClassDistribution = summary.byAssetClass.map((a) => ({
    assetClass: a._id,
    count: a.count,
  }));

  res.json({
    totalClients: totals.totalClients,
    aggregateNetWorth: totals.aggregateNetWorth,
    averageNetWorth: Math.round((totals.averageNetWorth || 0) * 100) / 100,
    categoryDistribution,
    assetClassDistribution,
  });
});

// GET /api/clients/:id
const getClientById = asyncHandler(async (req, res) => {
  const client = await Client.findOne({ _id: req.params.id, advisor: req.advisor._id });
  if (!client) {
    return res.status(404).json({ message: 'Client not found.' });
  }
  res.json({ client });
});

// POST /api/clients
const createClient = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    netWorth,
    category,
    primaryAssetClass,
    interests,
    onboardingDate,
  } = req.body;

  const client = await Client.create({
    name,
    email,
    phone,
    netWorth,
    category,
    primaryAssetClass,
    interests,
    onboardingDate,
    advisor: req.advisor._id,
  });

  res.status(201).json({ client });
});

// PUT /api/clients/:id
const updateClient = asyncHandler(async (req, res) => {
  const allowedFields = [
    'name',
    'email',
    'phone',
    'netWorth',
    'category',
    'primaryAssetClass',
    'interests',
    'onboardingDate',
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const client = await Client.findOneAndUpdate(
    { _id: req.params.id, advisor: req.advisor._id },
    updates,
    { new: true, runValidators: true, context: 'query' }
  );

  if (!client) {
    return res.status(404).json({ message: 'Client not found.' });
  }

  res.json({ client });
});

// DELETE /api/clients/:id
const deleteClient = asyncHandler(async (req, res) => {
  const client = await Client.findOneAndDelete({
    _id: req.params.id,
    advisor: req.advisor._id,
  });

  if (!client) {
    return res.status(404).json({ message: 'Client not found.' });
  }

  res.json({ message: 'Client deleted.', id: req.params.id });
});

module.exports = {
  getClients,
  getInsights,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
};
