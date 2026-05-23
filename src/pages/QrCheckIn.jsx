import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { qrCheckIn } from '@/api/meetings';

export function QrCheckInPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking'); // checking | success | error

  useEffect(() => {
    qrCheckIn(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        {status === 'checking' && <p>Registrando asistencia…</p>}
        {status === 'success' && (
          <div>
            <p className="text-2xl font-bold text-olive-800">✓ Asistencia confirmada</p>
            <button onClick={() => navigate('/')} className="mt-4 btn-primary">Ir al inicio</button>
          </div>
        )}
        {status === 'error' && (
          <div>
            <p className="text-xl text-clay-700">QR inválido o ya utilizado</p>
            <button onClick={() => navigate('/')} className="mt-4 btn-ghost">Ir al inicio</button>
          </div>
        )}
      </div>
    </div>
  );
}
