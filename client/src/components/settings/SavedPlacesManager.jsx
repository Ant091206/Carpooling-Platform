import { useState, useEffect } from 'react';
import { MapPin, Home, Briefcase, Plus, Trash2, Edit2, Star, CheckCircle } from 'lucide-react';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

export default function SavedPlacesManager() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);

  const [form, setForm] = useState({
    place_name: 'Home',
    address: '',
    latitude: 12.9716,
    longitude: 77.5946,
    is_default: false
  });

  const fetchSavedPlaces = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/saved-places');
      setPlaces(res.data.data || []);
    } catch (e) {
      toast.error('Failed to load saved places');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPlaces();
  }, []);

  const handleOpenAdd = (presetName = '') => {
    setEditingPlace(null);
    setForm({
      place_name: presetName || 'Home',
      address: '',
      latitude: 12.9716,
      longitude: 77.5946,
      is_default: false
    });
    setShowModal(true);
  };

  const handleOpenEdit = (place) => {
    setEditingPlace(place);
    setForm({
      place_name: place.place_name,
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
      is_default: Boolean(place.is_default)
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPlace) {
        await api.put(`/user/saved-places/${editingPlace.id}`, form);
        toast.success('Saved place updated successfully!');
      } else {
        await api.post('/user/saved-places', form);
        toast.success('Saved place added successfully!');
      }
      setShowModal(false);
      fetchSavedPlaces();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save location');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/user/saved-places/${id}`);
      toast.success('Saved place removed');
      fetchSavedPlaces();
    } catch (e) {
      toast.error('Failed to delete place');
    }
  };

  const getPlaceIcon = (name) => {
    const lname = name.toLowerCase();
    if (lname.includes('home')) return Home;
    if (lname.includes('office') || lname.includes('work')) return Briefcase;
    return MapPin;
  };

  return (
    <Card className="p-6 bg-white border border-slate-100 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-600" /> Saved Locations
          </h3>
          <p className="text-xs text-slate-500">Quickly pick Home, Office, and frequent pickup/dropoff points when searching or offering rides.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => handleOpenAdd('Home')}>+ Home</Button>
          <Button size="sm" variant="secondary" onClick={() => handleOpenAdd('Office')}>+ Office</Button>
          <Button size="sm" onClick={() => handleOpenAdd('')} icon={Plus}>Custom Place</Button>
        </div>
      </div>

      {places.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-500 text-xs space-y-2">
          <p className="font-bold text-slate-700">No saved places found.</p>
          <p>Save your Home and Office addresses to enable 1-click route booking!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {places.map((place) => {
            const Icon = getPlaceIcon(place.place_name);
            return (
              <div 
                key={place.id} 
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition flex items-start justify-between gap-3 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{place.place_name}</span>
                      {Boolean(place.is_default) && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Default</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{place.address}</p>
                  </div>
                </div>

                <div className="flex gap-1">
                  <button 
                    onClick={() => handleOpenEdit(place)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(place.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Place Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="font-heading text-lg font-bold text-slate-900">
              {editingPlace ? 'Edit Saved Location' : 'Add Saved Location'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Place Tag Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Home, Office, Tech Park"
                  value={form.place_name} 
                  onChange={(e) => setForm({ ...form, place_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Address / Location Landmark</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Street address, city, pin..."
                  value={form.address} 
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="is_default"
                  checked={form.is_default}
                  onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="is_default" className="text-xs font-bold text-slate-700">Set as default location</label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit">Save Location</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
}
