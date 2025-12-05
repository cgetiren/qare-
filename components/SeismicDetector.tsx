import React, { useState, useEffect, useRef } from 'react';
import { X, Activity, Volume2, VolumeX, ShieldCheck, AlertTriangle } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const SeismicDetector: React.FC<Props> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [isAlarmTriggered, setIsAlarmTriggered] = useState(false);
  const [sensitivity, setSensitivity] = useState(2.0); // Threshold for motion (m/s^2)
  const [currentMotion, setCurrentMotion] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Initialize Audio Context (Standard Web Audio API)
  const initAudio = () => {
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();
    }
  };

  const startAlarm = () => {
    if (isAlarmTriggered) return;
    setIsAlarmTriggered(true);

    if (audioContextRef.current) {
      if(audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      // Create Siren Sound
      oscillatorRef.current = audioContextRef.current.createOscillator();
      gainNodeRef.current = audioContextRef.current.createGain();

      oscillatorRef.current.type = 'sawtooth';
      oscillatorRef.current.frequency.setValueAtTime(440, audioContextRef.current.currentTime);
      
      // Modulate frequency to create siren effect
      const now = audioContextRef.current.currentTime;
      oscillatorRef.current.frequency.linearRampToValueAtTime(880, now + 0.5);
      oscillatorRef.current.frequency.linearRampToValueAtTime(440, now + 1.0);
      
      // Loop the frequency modulation manually or via LFO (simplified here to constant tone for browser compatibility)
      // For a better siren, we use a simple interval to modulate pitch if the node supports it
      
      gainNodeRef.current.connect(audioContextRef.current.destination);
      oscillatorRef.current.connect(gainNodeRef.current);
      oscillatorRef.current.start();
    }
  };

  const stopAlarm = () => {
    setIsAlarmTriggered(false);
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (e) {
        console.error("Audio stop error", e);
      }
      oscillatorRef.current = null;
    }
  };

  // Toggle Detection
  const toggleActive = () => {
    if (!isActive) {
      // Start
      initAudio();
      setIsActive(true);
    } else {
      // Stop
      setIsActive(false);
      stopAlarm();
    }
  };

  useEffect(() => {
    let lastX = 0, lastY = 0, lastZ = 0;

    const handleMotion = (event: DeviceMotionEvent) => {
      if (!isActive) return;

      const acc = event.accelerationIncludingGravity || event.acceleration;
      if (!acc) return;

      const x = acc.x || 0;
      const y = acc.y || 0;
      const z = acc.z || 0;

      // Calculate delta (change in acceleration) to detect shake regardless of orientation
      const deltaX = Math.abs(x - lastX);
      const deltaY = Math.abs(y - lastY);
      const deltaZ = Math.abs(z - lastZ);

      // Simple shake vector magnitude
      const motion = Math.max(deltaX, deltaY, deltaZ);
      
      // Smooth visual output
      setCurrentMotion(prev => (prev * 0.9) + (motion * 0.1));

      if (motion > sensitivity) {
        startAlarm();
      }

      lastX = x;
      lastY = y;
      lastZ = z;
    };

    if (isActive) {
      // Request permission for iOS 13+ if needed
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        (DeviceMotionEvent as any).requestPermission()
          .then((response: string) => {
            if (response === 'granted') {
              window.addEventListener('devicemotion', handleMotion);
            }
          })
          .catch(console.error);
      } else {
        window.addEventListener('devicemotion', handleMotion);
      }
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      stopAlarm();
    };
  }, [isActive, sensitivity]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b border-slate-700">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Activity className="text-red-500" />
          Sarsıntı Algılayıcı
        </h2>
        <button onClick={onClose} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700">
          <X size={20} />
        </button>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col items-center justify-center p-6 text-center transition-colors duration-100 ${isAlarmTriggered ? 'bg-red-600 animate-pulse' : 'bg-slate-900'}`}>
        
        {isAlarmTriggered ? (
          <div className="space-y-6">
            <AlertTriangle size={120} className="mx-auto text-white" />
            <h1 className="text-4xl font-black uppercase tracking-widest">DEPREM!</h1>
            <p className="text-xl">Sarsıntı tespit edildi. Çök - Kapan - Tutun!</p>
            <button 
              onClick={stopAlarm}
              className="px-8 py-4 bg-white text-red-600 font-bold rounded-xl text-xl shadow-xl active:scale-95 transition-transform"
            >
              ALARMI DURDUR
            </button>
          </div>
        ) : (
          <div className="space-y-8 w-full max-w-sm">
            
            <div className={`w-48 h-48 mx-auto rounded-full border-4 flex items-center justify-center transition-all duration-300 ${isActive ? 'border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.3)]' : 'border-slate-700'}`}>
               {isActive ? (
                 <ShieldCheck size={80} className="text-green-500" />
               ) : (
                 <Activity size={80} className="text-slate-600" />
               )}
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-2">
                {isActive ? 'Nöbet Modu Aktif' : 'Algılayıcı Pasif'}
              </h3>
              <p className="text-slate-400 text-sm">
                {isActive 
                  ? 'Telefonu sabit bir zemine bırakın. Sarsıntı algılanırsa alarm çalacaktır.' 
                  : 'Uyurken veya sabit dururken ani sarsıntıları algılamak için başlatın.'}
              </p>
            </div>

            <button
              onClick={toggleActive}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-3 ${
                isActive 
                  ? 'bg-slate-800 text-white border border-slate-600' 
                  : 'bg-green-600 text-white shadow-lg shadow-green-900'
              }`}
            >
              {isActive ? 'Durdur' : 'Nöbeti Başlat'}
            </button>
            
            {/* Sensitivity Slider */}
             <div className="bg-slate-800 p-4 rounded-xl">
               <div className="flex justify-between text-xs text-slate-400 mb-2">
                 <span>Hassasiyet: {sensitivity}</span>
                 <span>(Anlık Hareket: {currentMotion.toFixed(2)})</span>
               </div>
               <input 
                 type="range" 
                 min="0.5" 
                 max="10.0" 
                 step="0.5"
                 value={sensitivity}
                 onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                 className="w-full accent-green-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                 disabled={isActive}
               />
               <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                 <span>Çok Hassas</span>
                 <span>Az Hassas</span>
               </div>
             </div>

          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="p-4 bg-slate-800 text-xs text-slate-400 text-center">
        <p>⚠️ Bu özellik web tarayıcısı üzerinden çalışır. <br/>Ekran açık kalmalıdır. Profesyonel sismograf değildir.</p>
      </div>
    </div>
  );
};

export default SeismicDetector;