require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const registerRoutes = require('./routes/register');
const authRoutes = require('./routes/auth');
const collegeRoutes = require('./routes/colleges');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

const allowedOrigins = String(process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map(v => v.trim())
  .filter(Boolean);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.length === 0) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('CORS origin not allowed.'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '30kb' }));
app.use(express.urlencoded({ extended: true, limit: '30kb' }));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.'
  }
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many OTP requests. Please wait and try again.'
  }
});

app.use(generalLimiter);

app.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'Shree Krishna EduTech API',
    status: 'running'
  });
});

app.get('/health', async (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;

  res.json({
    success: true,
    server: 'ok',
    database: dbReady ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/register/send-otp', otpLimiter);
app.use('/api/register/resend-otp', otpLimiter);
app.use('/api/register', registerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/colleges', collegeRoutes);

app.use((err, req, res, next) => {
  console.error(err);

  if (err.message === 'CORS origin not allowed.') {
    return res.status(403).json({
      success: false,
      message: 'Request origin is not allowed.'
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Internal server error.'
  });
});

const PORT = Number(process.env.PORT || 5000);

async function start() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing from the environment.');
  }

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'CHANGE_THIS_TO_A_LONG_RANDOM_SECRET') {
    throw new Error('JWT_SECRET must be changed before starting the server.');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  app.listen(PORT, () => {
    console.log(`Shree Krishna EduTech API listening on port ${PORT}`);
  });
}

start().catch(error => {
  console.error('Startup failed:', error);
  process.exit(1);
});
