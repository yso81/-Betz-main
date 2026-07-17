import { useState } from 'react';
import { MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { haversineDistance } from '../../utils/geoUtils';

interface LocationCheckinProps {
  targetLat: number;
  targetLng: number;
  targetRadiusM: number;
  onLocationVerified: (lat: number, lng: number) => void;
  onLocationFailed: (error: string) => void;
}

export default function LocationCheckin({
  targetLat,
  targetLng,
  targetRadiusM,
  onLocationVerified,
  onLocationFailed,
}: LocationCheckinProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  const handleVerifyLocation = () => {
    setIsLoading(true);
    setError(null);
    setDistance(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const dist = haversineDistance(latitude, longitude, targetLat, targetLng);
        setDistance(Math.round(dist));

        if (dist <= targetRadiusM) {
          setIsVerified(true);
          setIsLoading(false);
          onLocationVerified(latitude, longitude);
        } else {
          setError(`You're ${Math.round(dist)}m away. Must be within ${targetRadiusM}m.`);
          setIsLoading(false);
          onLocationFailed(`Too far: ${Math.round(dist)}m from target`);
        }
      },
      (geoError) => {
        let msg: string;
        switch (geoError.code) {
          case 1:
            msg = 'Location permission denied. Please enable it in your browser settings.';
            break;
          case 2:
            msg = 'Location unavailable. Check your connection.';
            break;
          case 3:
            msg = 'Location request timed out. Try again.';
            break;
          default:
            msg = 'An unknown location error occurred.';
        }
        setError(msg);
        setIsLoading(false);
        onLocationFailed(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  if (isVerified) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
        <div>
          <p className="text-xs font-bold text-emerald-700">Location verified!</p>
          {distance !== null && (
            <p className="text-[10px] text-emerald-600">You're at the right spot ({distance}m)</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleVerifyLocation}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-600 text-white transition-colors disabled:opacity-50"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Getting location...
          </span>
        ) : (
          <>
            <MapPin className="w-4 h-4" />
            Verify Location
          </>
        )}
      </button>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <p className="text-[10px] text-rose-600">{error}</p>
        </div>
      )}
    </div>
  );
}
