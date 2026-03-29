import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { handlePaystackWebhook } from './routes/paymentsWebhook.js';
import paymentRoutes from './routes/payments.js';
import verifyRoutes from './routes/verify.js';
import authRoutes from './routes/auth.js';
import registrationRoutes from './routes/registrations.js';
import parcelRoutes from './routes/parcels.js';
import transferRoutes from './routes/transfers.js';
import disputeRoutes from './routes/disputes.js';
import notificationRoutes from './routes/notifications.js';
import analyticsRoutes from './routes/analytics.js';
import userRoutes from './routes/users.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    void handlePaystackWebhook(req, res).catch(next);
  }
);

app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/verify', verifyRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/parcels', parcelRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'smartland-api' });
});

app.listen(PORT, () => {
  console.log(`SmartLand API running at http://localhost:${PORT}`);
});
