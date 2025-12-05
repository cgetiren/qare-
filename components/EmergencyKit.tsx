import React from 'react';
import { useStore } from '../store/useStore';
import { Backpack, CheckCircle2, Circle, RefreshCw } from 'lucide-react';

const EmergencyKit: React.FC = () => {
  const { kitItems, toggleKitItem, resetKit } = useStore();

  const progress = Math.round(
    (kitItems.filter((i) => i.checked).length / kitItems.length) * 100
  );

  const categories = {
    essentials: 'Temel İhtiyaçlar',
    medical: 'Medikal & Hijyen',
    tools: 'Araç Gereç',
    docs: 'Evraklar',
  };

  return (
    <div className="p-4 pb-24">
      <div className="bg-orange-500 text-white p-6 rounded-2xl shadow-lg mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Backpack />
            Deprem Çantası
          </h2>
          <span className="text-2xl font-bold">%{progress}</span>
        </div>
        <div className="w-full bg-orange-700/30 rounded-full h-2.5">
          <div 
            className="bg-white h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-orange-100 text-sm mt-2">
          Hazırlık hayat kurtarır. Eksikleri tamamlayın.
        </p>
      </div>

      <div className="space-y-6">
        {(Object.keys(categories) as Array<keyof typeof categories>).map((catKey) => {
          const items = kitItems.filter((i) => i.category === catKey);
          if (items.length === 0) return null;

          return (
            <div key={catKey}>
              <h3 className="font-semibold text-slate-500 uppercase text-xs tracking-wider mb-2 ml-1">
                {categories[catKey]}
              </h3>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden divide-y divide-slate-100">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleKitItem(item.id)}
                    className="w-full flex items-center p-4 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className={`mr-4 ${item.checked ? 'text-green-500' : 'text-slate-300'}`}>
                      {item.checked ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                    </div>
                    <span className={`flex-1 ${item.checked ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <button 
        onClick={() => {
          if(confirm('Listenizi sıfırlamak istediğinize emin misiniz?')) resetKit();
        }}
        className="mt-8 w-full py-3 flex items-center justify-center gap-2 text-slate-400 hover:text-red-500 transition-colors"
      >
        <RefreshCw size={16} />
        Listeyi Sıfırla
      </button>
    </div>
  );
};

export default EmergencyKit;
