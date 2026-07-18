import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Calendar, Car, Clock, MapPin, Users, Coins, ArrowRight, ShieldAlert } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import PageShell from '../components/shared/PageShell.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Badge from '../components/ui/Badge.jsx';
import api from '../services/api.js';
import rideService from '../services/ride.service.js';
import mapsService from '../services/maps.service.js';

const offerSchema = z.object({
  pickup: z.string().min(1, 'Pickup address is required'),
  destination: z.string().min(1, 'Destination is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  seats: z.coerce.number().min(1, 'Available seats must be at least 1').max(4),
  vehicleId: z.coerce.number().min(1, 'Select a vehicle'),
  fare: z.coerce.number().min(10, 'Minimum fare per seat is INR 10'),
  notes: z.string().optional()
});

export default function OfferRide() {
  const navigate = useNavigate();
  const [driverVehicles, setDriverVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [routeInfo, setRouteInfo] = useState(null);
  const [calculatingRoute, setCalculatingRoute] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [confirmData, setConfirmData] = useState(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(offerSchema)
  });

  // Fetch registered driver vehicles on mount
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoadingVehicles(true);
        const response = await api.get('/vehicle');
        const list = response.data.data || [];
        setDriverVehicles(list);
        if (list.length > 0) {
          setValue('vehicleId', list[0].id);
        }
      } catch (err) {
        console.error("Error fetching vehicles:", err.message);
      } finally {
        setLoadingVehicles(false);
      }
    };
    fetchVehicles();
  }, [setValue]);

  const handleReviewRoute = async (data) => {
    setCalculatingRoute(true);
    try {
      const info = await mapsService.calculateRoute(data.pickup, data.destination);
      setRouteInfo(info);
      setConfirmData(data);
      
      // Calculate a default fare based on distance (e.g. 15 INR per km) if not overridden
      const kmDistance = parseFloat(info.distance.replace(/[^0-9.]/g, '')) || 10;
      const estimatedFare = Math.round(kmDistance * 12);
      setValue('fare', estimatedFare);
      
      toast.success('Route checked successfully. Preview details to publish.');
    } catch (e) {
      toast.error('Failed to map route. Check location spellings.');
    } finally {
      setCalculatingRoute(false);
    }
  };

  const handlePublishRide = async () => {
    if (!confirmData || !routeInfo) return;

    setPublishing(true);
    try {
      const departureDateTime = new Date(`${confirmData.date}T${confirmData.time}:00`).toISOString();
      
      const payload = {
        vehicle_id: parseInt(confirmData.vehicleId, 10),
        pickup_name: confirmData.pickup,
        pickup_lng: routeInfo.originCoords.lng,
        pickup_lat: routeInfo.originCoords.lat,
        destination_name: confirmData.destination,
        dest_lng: routeInfo.destCoords.lng,
        dest_lat: routeInfo.destCoords.lat,
        departure_time: departureDateTime,
        available_seats: parseInt(confirmData.seats, 10),
        fare_per_seat: parseFloat(confirmData.fare),
        notes: confirmData.notes || '',
        is_recurring: false
      };

      await rideService.publishRide(payload);
      toast.success('Your ride has been published successfully!');
      navigate('/dashboard');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to publish ride.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <PageShell 
      eyebrow="Driver mode" 
      title="Offer a Ride" 
      description="Publish your office route, select a registered vehicle, and invite colleagues to book seats."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <Card className="p-6 bg-white">
          {loadingVehicles ? (
            <div className="flex h-48 items-center justify-center">
              <span className="text-emerald-700 animate-pulse font-bold">Querying corporate vehicle database...</span>
            </div>
          ) : driverVehicles.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-amber-200 bg-amber-50/50 p-6 text-center">
              <ShieldAlert className="h-10 w-10 text-amber-600 mx-auto mb-3" />
              <p className="font-bold text-slate-800">No Vehicle Registered</p>
              <p className="text-sm text-slate-600 mt-1 max-w-xs mx-auto">You must register a vehicle in profile settings before publishing open seat offers.</p>
              <Link to="/my-vehicle">
                <Button className="mt-4" size="md">Register Vehicle Now &rarr;</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(handleReviewRoute)} className="space-y-4">
              <Input 
                icon={MapPin} 
                label="Pickup address" 
                placeholder="HSR Layout Sector 3" 
                error={errors.pickup?.message} 
                {...register('pickup')} 
              />
              <Input 
                icon={MapPin} 
                label="Destination address" 
                placeholder="Acme Corporate Towers" 
                error={errors.destination?.message} 
                {...register('destination')} 
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input 
                  icon={Calendar} 
                  label="Date" 
                  type="date" 
                  error={errors.date?.message} 
                  {...register('date')} 
                />
                <Input 
                  icon={Clock} 
                  label="Time" 
                  type="time" 
                  error={errors.time?.message} 
                  {...register('time')} 
                />
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <Input 
                  icon={Users} 
                  label="Available seats" 
                  type="number" 
                  min="1" 
                  max="4" 
                  placeholder="3" 
                  error={errors.seats?.message} 
                  {...register('seats')} 
                />
                <Input 
                  icon={Coins} 
                  label="Fare per seat (INR)" 
                  type="number" 
                  placeholder="150" 
                  error={errors.fare?.message} 
                  {...register('fare')} 
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-800">Choose Vehicle</label>
                <select 
                  className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  {...register('vehicleId')}
                >
                  {driverVehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.model} ({vehicle.color}) - {vehicle.plateNumber}
                    </option>
                  ))}
                </select>
                {errors.vehicleId && (
                  <p className="text-xs text-rose-500 font-semibold mt-1">{errors.vehicleId.message}</p>
                )}
              </div>

              <Input 
                label="Additional commute comments" 
                placeholder="Will stop brief at Silkboard. No food inside vehicle." 
                error={errors.notes?.message} 
                {...register('notes')} 
              />

              <Button type="submit" loading={calculatingRoute} className="w-full mt-2" size="lg">Review Commute Route</Button>
            </form>
          )}
        </Card>

        {/* Route Confirmation Map Panel */}
        <Card className="p-6 bg-white space-y-5">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Car className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-heading text-2xl font-extrabold text-slate-950">Publish Route</h3>
              <p className="text-sm text-slate-600">Review coordinates mapping and publish seats.</p>
            </div>
          </div>

          {confirmData && routeInfo ? (
            <div className="space-y-4 bg-emerald-50/50 p-5 rounded-3xl border border-emerald-100">
              <Badge variant="success">Geocoding OK</Badge>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm text-slate-800">
                  <MapPin className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900">Pickup:</span> {confirmData.pickup}
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm text-slate-800">
                  <MapPin className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900">Destination:</span> {confirmData.destination}
                  </div>
                </div>
              </div>

              <div className="border-t border-dashed border-emerald-200 pt-3 text-sm text-slate-600 grid grid-cols-2 gap-2">
                <div>
                  <span className="font-bold text-slate-900">Distance:</span> {routeInfo.distance}
                </div>
                <div>
                  <span className="font-bold text-slate-900">Est. Duration:</span> {routeInfo.duration}
                </div>
                <div>
                  <span className="font-bold text-slate-900">Time:</span> {confirmData.time}
                </div>
                <div>
                  <span className="font-bold text-slate-900">Fare/Seat:</span> INR {confirmData.fare}
                </div>
              </div>

              <Button 
                onClick={handlePublishRide} 
                loading={publishing} 
                className="w-full mt-4"
                size="lg"
                icon={ArrowRight}
              >
                Publish Ride to Workspace
              </Button>
            </div>
          ) : (
            <div className="rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center text-slate-400">
              Fill and submit the route check form to preview distance geocoding metrics before publishing live seats.
            </div>
          )}
        </Card>
      </div>
    </PageShell>
  );
}
