import React, { useState, useMemo } from 'react';
import { Earthquake } from '../types';
import { MapPin, Activity, Search, Filter, Info, WifiOff, Clock } from 'lucide-react';

interface Props {
  earthquakes: Earthquake[];
  loading: boolean;
}

const EarthquakeList: React.FC<Props> = ({ earthquakes, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [minMag, setMinMag] = useState<number>(0);

  // Helper to format date and time
  const formatTime = (dateString: string) => {
    try {
      if (!dateString) throw new Error("Date string empty");

      // Kandilli format usually: "2024.10.27 14:30:00"
      // Robust parsing: Split by any non-digit char to get parts
      const parts = dateString.split(/[^0-9]/).filter(p => p.length > 0);
      
      let quakeDate = new Date();
      
      if (parts.length >= 6) {
        // Year, Month (0-based), Day, Hour, Minute, Second
        quakeDate = new Date(
          parseInt(parts[0]),
          parseInt(parts[1]) - 1,
          parseInt(parts[2]),
          parseInt(parts[3]),
          parseInt(parts[4]),
          parseInt(parts[5])
        );
      } else {
        // Fallback for unexpected formats, try standard parse
        quakeDate = new Date(dateString.replace(/\./g, '-'));
      }

      if (isNaN(quakeDate.getTime())) {
         return { shortTime: '-', relative: '-', fullDate: dateString };
      }

      // Calculate relative time
      const now = new Date();
      const diffMs = now.getTime() - quakeDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      let relative = '';
      if (diffMins < 1) relative = 'Şimdi';
      else if (diffMins < 60) relative = `${diffMins} dk önce`;
      else if (diffHours < 24) relative = `${diffHours} sa önce`;
      else relative = `${Math.floor(diffHours / 24)} gün önce`;

      // Return time HH:MM:SS
      const hours = quakeDate.getHours().toString().padStart(2, '0');
      const minutes = quakeDate.getMinutes().toString().padStart(2, '0');
      const seconds = quakeDate.getSeconds().toString().padStart(2, '0');
      
      const shortTime = `${hours}:${minutes}:${seconds}`;
      
      // Date part DD.MM.YYYY
      const day = quakeDate.getDate().toString().padStart(2, '0');
      const month = (quakeDate.getMonth() + 1).toString().padStart(2, '0');
      const year = quakeDate.getFullYear();
      const fullDate = `${day}.${month}.${year}`;

      return { shortTime, relative, fullDate };
    } catch (e) {
      console.warn("Date parsing error", e);
      return { shortTime: '-', relative: '-', fullDate: dateString };
    }
  };

  // Filter earthquakes based on search term and minimum magnitude
  const filteredEarthquakes = useMemo(() => {
    return earthquakes.filter((quake) => {
      const matchesSearch = quake.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMag = quake.mag >= minMag;
      return matchesSearch && matchesMag;
    });
  }, [earthquakes, searchTerm, minMag]);

  if (loading && earthquakes.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-full space-y-4 p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        <p className="text-slate-500 text-sm animate-pulse">Kandilli'den veriler alınıyor...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Sticky Filter Header */}
      <div className="sticky top-0 bg-white z-10 p-4 shadow-sm border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Activity className="text-red-600" />
          Son Depremler
        </h2>
        
        <div className="space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Şehir veya yer ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:text-slate-400"
            />
          </div>

          {/* Magnitude Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Filter size={16} className="text-slate-400 min-w-[16px]" />
            <button
              onClick={() => setMinMag(0)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                minMag === 0 ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setMinMag(3.0)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                minMag === 3.0 ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              > 3.0
            </button>
            <button
              onClick={() => setMinMag(4.0)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                minMag === 4.0 ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              > 4.0
            </button>
            <button
              onClick={() => setMinMag(5.0)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                minMag === 5.0 ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              > 5.0
            </button>
          </div>
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-3">
        {earthquakes.length === 0 ? (
           <div className="text-center py-10 text-slate-400 flex flex-col items-center gap-2">
             <WifiOff size={32} />
             <p>Veri alınamadı.</p>
             <p className="text-xs">Bağlantınızı kontrol edip tekrar deneyin.</p>
           </div>
        ) : filteredEarthquakes.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <p>Kriterlere uygun deprem bulunamadı.</p>
          </div>
        ) : (
          filteredEarthquakes.map((quake, index) => {
            const mag = quake.mag;
            const isSignificant = mag >= 4.0;
            const isModerate = mag >= 3.0 && mag < 4.0;
            const { shortTime, relative, fullDate } = formatTime(quake.date);
            
            let borderColor = 'border-slate-200';
            let bgColor = 'bg-white';
            let badgeColor = 'bg-slate-100 text-slate-700';

            if (isSignificant) {
              borderColor = 'border-red-500';
              bgColor = 'bg-red-50/50';
              badgeColor = 'bg-red-500 text-white shadow-red-200 shadow-lg';
            } else if (isModerate) {
              borderColor = 'border-orange-300';
              badgeColor = 'bg-orange-500 text-white';
            }

            return (
              <div 
                key={`${quake.id}-${index}`}
                className={`${bgColor} rounded-xl p-4 shadow-sm border-l-4 ${borderColor} transition-transform active:scale-[0.99]`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                     <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`text-lg font-bold flex items-center gap-1 ${isSignificant ? 'text-slate-800' : 'text-slate-700'}`}>
                          <Clock size={16} className="text-slate-400" />
                          {shortTime}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isSignificant ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                          {relative}
                        </span>
                     </div>
                    
                    <h3 className="font-semibold text-slate-800 text-sm md:text-base truncate leading-tight mb-2">
                      {quake.title}
                    </h3>
                    
                    <div className="flex items-center gap-3 text-slate-500 text-xs">
                      <span className="flex items-center gap-1">
                         {fullDate}
                      </span>
                      <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
                        <MapPin size={10} />
                        {quake.depth} km
                      </span>
                    </div>
                  </div>
                  
                  <div className={`flex flex-col items-center justify-center min-w-[3.5rem] h-14 rounded-xl ${badgeColor}`}>
                    <span className="font-bold text-xl">{mag.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {/* Footer Info */}
        <div className="text-center py-4 px-2">
          <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <Info size={12} />
            Veriler Kandilli Rasathanesi'nden alınmaktadır.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EarthquakeList;