import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Phone, UserPlus, Trash2, Send, AlertTriangle } from 'lucide-react';
import { EmergencyContact } from '../types';

const EmergencyContacts: React.FC = () => {
  const { contacts, addContact, removeContact, userLocation } = useStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    
    // Simple ID gen
    const newContact: EmergencyContact = {
      id: Date.now().toString(),
      name,
      phone
    };
    
    addContact(newContact);
    setName('');
    setPhone('');
    setIsAdding(false);
  };

  const getWhatsAppLink = (contactPhone: string) => {
    const locString = userLocation 
      ? `Konumum: https://www.google.com/maps?q=${userLocation.lat},${userLocation.lng}` 
      : 'Konum bilgisi alınamadı.';
    
    const message = `ACİL DURUM! Ben iyiyim ama deprem oldu. Lütfen beni ara. ${locString}`;
    const encodedMessage = encodeURIComponent(message);
    // Remove non-digit chars for phone link
    const cleanPhone = contactPhone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  };

  return (
    <div className="p-4 pb-24">
      <div className="bg-red-600 text-white p-6 rounded-2xl shadow-lg mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <AlertTriangle size={100} />
        </div>
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-2 relative z-10">
          <AlertTriangle />
          Acil Durum İletişimi
        </h2>
        <p className="text-red-100 relative z-10 text-sm">
          Deprem anında sevdiklerinize tek dokunuşla konumunuzu içeren mesaj gönderin.
        </p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800 text-lg">Kişilerim</h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
        >
          <UserPlus size={16} />
          {isAdding ? 'Vazgeç' : 'Ekle'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-slate-200">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Ad Soyad</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Örn: Annem"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Telefon (905xxxxxxxxx)</label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="905..."
                required
              />
            </div>
            <button type="submit" className="w-full bg-red-600 text-white py-2 rounded-lg font-medium">
              Kaydet
            </button>
          </div>
        </form>
      )}

      {contacts.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-300">
          <Phone className="mx-auto text-slate-300 mb-2" size={32} />
          <p className="text-slate-500">Henüz kişi eklenmemiş.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {contacts.map((contact) => (
            <div key={contact.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800">{contact.name}</h4>
                <p className="text-sm text-slate-500">{contact.phone}</p>
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href={getWhatsAppLink(contact.phone)}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow-md transition-colors"
                  title="WhatsApp Mesajı Gönder"
                >
                  <Send size={20} />
                </a>
                <button 
                  onClick={() => removeContact(contact.id)}
                  className="text-slate-300 hover:text-red-500 p-2"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmergencyContacts;
