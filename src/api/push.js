import { api } from './client';

export const getVapidKey = () =>
  api.get('/push/vapid-key').then((r) => r.data.publicKey);

export const subscribe = (subscription) =>
  api.post('/push/subscribe', {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))),
      auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')))),
    },
  });

export const unsubscribe = (endpoint) =>
  api.delete('/push/subscribe', { data: { endpoint } });
