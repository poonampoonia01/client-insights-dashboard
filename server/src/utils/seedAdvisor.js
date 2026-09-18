// Run with: npm run seed
// Creates one demo advisor (if not already present) and a handful of
// sample clients, so the dashboard has something to show on first run.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Advisor = require('../models/Advisor');
const Client = require('../models/Client');

const DEMO_EMAIL = 'demo.advisor@ledger.app';
const DEMO_PASSWORD = 'password123';

const SAMPLE_CLIENTS = [
  {
    name: 'Aditi Rao',
    email: 'aditi.rao@example.com',
    phone: '+91 98765 43210',
    netWorth: 420000000,
    category: 'UHNI',
    primaryAssetClass: 'Startups',
    interests: ['Venture Capital', 'ESG'],
    onboardingDate: new Date('2025-03-12'),
  },
  {
    name: 'Rohan Mehta',
    email: 'rohan.mehta@example.com',
    phone: '+91 91234 56780',
    netWorth: 85000000,
    category: 'HNI',
    primaryAssetClass: 'Equity',
    interests: ['Mid-cap equity', 'IPOs'],
    onboardingDate: new Date('2026-01-03'),
  },
  {
    name: 'Kavya Iyer',
    email: 'kavya.iyer@example.com',
    phone: '+91 99887 76655',
    netWorth: 210000000,
    category: 'UHNI',
    primaryAssetClass: 'Real Estate',
    interests: ['Commercial property', 'REITs'],
    onboardingDate: new Date('2024-11-20'),
  },
  {
    name: 'Farhan Sheikh',
    email: 'farhan.sheikh@example.com',
    phone: '+91 90000 11223',
    netWorth: 32000000,
    category: 'HNI',
    primaryAssetClass: 'Alternatives',
    interests: ['Structured products', 'Gold'],
    onboardingDate: new Date('2026-06-08'),
  },
];

async function seed() {
  await connectDB();

  let advisor = await Advisor.findOne({ email: DEMO_EMAIL });
  if (!advisor) {
    advisor = await Advisor.create({
      name: 'Demo Advisor',
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      firm: 'Ledger Wealth Partners',
    });
    console.log(`Created demo advisor: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  } else {
    console.log(`Demo advisor already exists: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  }

  const existingCount = await Client.countDocuments({ advisor: advisor._id });
  if (existingCount === 0) {
    await Client.insertMany(
      SAMPLE_CLIENTS.map((c) => ({ ...c, advisor: advisor._id }))
    );
    console.log(`Inserted ${SAMPLE_CLIENTS.length} sample clients.`);
  } else {
    console.log('Sample clients already present, skipping.');
  }

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
