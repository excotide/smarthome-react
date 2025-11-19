import express from 'express';
import webpush from 'web-push';
import PushSubscription from '../models/PushSubscription.js';
import User from '../models/User.js';

const router = express.Router();

// Public key endpoint (client fetches to register)
router.get('/public-key', (req, res) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) return res.status(500).json({ error: 'VAPID public key not configured' });
  res.json({ publicKey });
});

// Subscribe endpoint
router.post('/subscribe', async (req, res) => {
  try {
    const { subscription, userId } = req.body; // subscription = {endpoint, keys:{p256dh,auth}}
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ error: 'Invalid subscription payload' });
    }

    let user = null;
    if (userId) {
      user = await User.findById(userId).select('_id');
    }

    const existing = await PushSubscription.findOne({ endpoint: subscription.endpoint });
    if (existing) {
      // update keys if rotated
      existing.keys = subscription.keys;
      existing.user = user ? user._id : existing.user;
      await existing.save();
      return res.json({ status: 'updated' });
    }

    await PushSubscription.create({
      user: user ? user._id : undefined,
      endpoint: subscription.endpoint,
      keys: subscription.keys
    });

    res.json({ status: 'subscribed' });
  } catch (e) {
    console.error('Subscribe error', e);
    res.status(500).json({ error: 'Server error subscribing' });
  }
});

// Unsubscribe endpoint
router.post('/unsubscribe', async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) return res.status(400).json({ error: 'Endpoint required' });
    await PushSubscription.deleteOne({ endpoint });
    res.json({ status: 'unsubscribed' });
  } catch (e) {
    console.error('Unsubscribe error', e);
    res.status(500).json({ error: 'Server error unsubscribing' });
  }
});

// Test send (optional)
router.post('/test', async (req, res) => {
  try {
    const { endpoint, title = 'Test', body = 'Hello from server' } = req.body;
    if (!endpoint) return res.status(400).json({ error: 'Endpoint required' });
    const sub = await PushSubscription.findOne({ endpoint });
    if (!sub) return res.status(404).json({ error: 'Subscription not found' });
    const payload = JSON.stringify({ title, body });
    await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload);
    res.json({ status: 'sent' });
  } catch (e) {
    console.error('Test push error', e);
    res.status(500).json({ error: 'Failed to send test push' });
  }
});

export default router;
