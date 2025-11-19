import { useCallback, useState } from 'react';

// Helper convert base64 (URL safe) -> Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export default function usePushNotifications(userId) {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getRegistration = async () => {
    if (!('serviceWorker' in navigator)) throw new Error('ServiceWorker tidak didukung');
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) throw new Error('Service worker belum terdaftar');
    return reg;
  };

  const subscribe = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      // Permission
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') throw new Error('Izin notifikasi ditolak');

      const resKey = await fetch('http://localhost:3000/api/push/public-key');
      if (!resKey.ok) throw new Error('Gagal mengambil public key');
      const { publicKey } = await resKey.json();
      if (!publicKey) throw new Error('Public key kosong');

      const reg = await getRegistration();
      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        setSubscribed(true);
        return existing; // sudah
      }

      const newSub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      // Kirim ke server
      const resp = await fetch('http://localhost:3000/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: newSub.toJSON(), userId })
      });
      if (!resp.ok) throw new Error('Gagal kirim subscription ke server');

      setSubscribed(true);
      return newSub;
    } catch (e) {
      console.error(e);
      setError(e.message);
      setSubscribed(false);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const unsubscribe = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const reg = await getRegistration();
      const sub = await reg.pushManager.getSubscription();
      if (!sub) {
        setSubscribed(false);
        return;
      }
      await fetch('http://localhost:3000/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint })
      });
      const success = await sub.unsubscribe();
      setSubscribed(false);
      return success;
    } catch (e) {
      console.error(e);
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { subscribed, loading, error, subscribe, unsubscribe };
}
