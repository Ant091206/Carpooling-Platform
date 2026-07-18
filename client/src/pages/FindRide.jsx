import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Calendar, Clock, MapPin, Users, Info as InfoIcon, Wallet, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/shared/PageShell.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Badge from '../components/ui/Badge.jsx';
import { useRides } from '../context/RideContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import mapsService from '../services/maps.service.js';
import rideService from '../services/ride.service.js';
import bookingService from '../services/booking.service.js';
import paymentService from '../services/payment.service.js';

const searchSchema = z.object({
  pickup: z.string().min(1, 'Pickup point is required'),
  destination: z.string().min(1, 'Destination is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  seats: z.coerce.number().min(1, 'Seats must be at least 1').max(4, 'Maximum of 4 seats allowed')
});

export default function FindRide() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { searchParams, setSearchParams, activeRoute, setActiveRoute, calculateRouteDetails } = useRides();
  const [step, setStep] = useState('form');
  const [rides, setRides] = useState([]);
  const [searching, setSearching] = useState(false);
  const [bookingRideId, setBookingRideId] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(searchSchema),
    defaultValues: searchParams
  });

  // Dynamically load Razorpay SDK script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSearch = async (data) => {
    setSearchParams(data);
    setSearching(true);
    try {
      // 1. Calculate map directions route
      const routeInfo = await calculateRouteDetails(data.pickup, data.destination);
      if (!routeInfo) {
        toast.error('Could not compute map directions for this route.');
      }

      // 2. Fetch matches from database
      const matchingRides = await rideService.searchRides({
        pickup: data.pickup,
        destination: data.destination,
        date: data.date
      });

      // Filter out driver's own published rides
      const filtered = matchingRides.filter(r => r.driver_id !== user?.id);
      setRides(filtered);
      setStep('confirm');
      toast.success('Route fetched! Confirm commute details to see rides.');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to search rides.');
    } finally {
      setSearching(false);
    }
  };

  const handleBookRide = async (ride) => {
    setBookingRideId(ride.id);
    const seatSelection = parseInt(searchParams.seats, 10) || 1;
    
    try {
      // 1. Create a pending booking
      const booking = await bookingService.createBooking(ride.id, seatSelection);
      toast.success('Commute reservation initialized. Loading checkout...');

      // 2. Create Razorpay order
      const order = await paymentService.createOrder(booking.id);

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_dummyKeyId';
      const fareAmount = parseFloat(ride.fare_per_seat) * seatSelection;

      // 3. Configure Razorpay payment options
      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: 'EnterprisePool',
        description: `Ride from ${ride.pickup_name} to ${ride.destination_name}`,
        order_id: order.id,
        handler: async (response) => {
          // On successful payment transaction
          try {
            await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: booking.id
            });
            toast.success('Payment verified! Ride booked successfully.');
            navigate('/my-trips');
          } catch (verifyErr) {
            toast.error('Signature verification failed. Please contact corporate helpdesk.');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone
        },
        theme: {
          color: '#059669' // Emerald Green brand
        },
        modal: {
          ondismiss: () => {
            toast.error('Booking checkout payment cancelled.');
            setBookingRideId(null);
          }
        }
      };

      if (order.isMock) {
        // Handle mock payment environment triggers directly
        toast.loading('Simulating workspace gateway checkout...');
        setTimeout(async () => {
          try {
            await paymentService.verifyPayment({
              bookingId: booking.id,
              isMock: true
            });
            toast.dismiss();
            toast.success('Mock transaction completed! Booking accepted.');
            navigate('/my-trips');
          } catch (verifyErr) {
            toast.dismiss();
            toast.error('Mock verification failed.');
          }
        }, 1500);
      } else {
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to complete booking reservation.');
      setBookingRideId(null);
    }
  };

  return (
    <PageShell 
      eyebrow="Ride search" 
      title="Find a Ride" 
      description="Search by pickup, destination, time, and seats. Confirm the route before booking."
    >
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.2fr]">
        <Card className="p-6 bg-white">
          <form onSubmit={handleSubmit(handleSearch)} className="space-y-4">
            <Input 
              icon={MapPin} 
              label="Pickup location" 
              placeholder="Indiranagar Metro Station" 
              error={errors.pickup?.message} 
              {...register('pickup')} 
            />
            <Input 
              icon={MapPin} 
              label="Destination address" 
              placeholder="Acme Tech Park Outer Ring Road" 
              error={errors.destination?.message} 
              {...register('destination')} 
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input 
                icon={Calendar} 
                label="Commute Date" 
                type="date" 
                error={errors.date?.message} 
                {...register('date')} 
              />
              <Input 
                icon={Clock} 
                label="Commute Time" 
                type="time" 
                error={errors.time?.message} 
                {...register('time')} 
              />
            </div>
            <Input 
              icon={Users} 
              label="Seats requested" 
              type="number" 
              min="1" 
              max="4" 
              placeholder="1" 
              error={errors.seats?.message} 
              {...register('seats')} 
            />
            <Button type="submit" loading={searching} className="w-full mt-2" size="lg">Calculate Route & Search</Button>
          </form>
        </Card>
        
        <div className="space-y-6">
          {step === 'form' && (
            <RoutePanel 
              title="Route confirmation" 
              text="Enter the ride details to preview your route, stops, and matching rides." 
            />
          )}
          {step === 'confirm' && (
            <RoutePanel 
              title={`${searchParams.pickup} to ${searchParams.destination}`} 
              text={`Commute scheduled on ${searchParams.date} at ${searchParams.time} requesting ${searchParams.seats} seat(s).`} 
              route={activeRoute}
              action={
                <Button onClick={() => setStep('rides')} className="w-full" size="lg">
                  Show Matching Employee Rides ({rides.length})
                </Button>
              }
            />
          )}
          {step === 'rides' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-heading text-xl font-bold text-slate-900">Available Commutes</h3>
                <Button variant="secondary" size="sm" onClick={() => setStep('confirm')}>Back to Route Map</Button>
              </div>
              
              {rides.length > 0 ? (
                rides.map((ride) => (
                  <Card key={ride.id} className="p-5 bg-white border border-slate-100 hover:border-emerald-200 transition">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-heading text-lg font-extrabold text-slate-950">{ride.driver_name || 'Verified Employee'}</h3>
                        <p className="text-sm text-slate-500 capitalize">{ride.vehicle_model} ({ride.vehicle_color}) - {ride.driver_department}</p>
                      </div>
                      <Badge variant="success">Seats: {ride.available_seats} left</Badge>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3 mt-4 bg-slate-50 p-4 rounded-2xl text-sm">
                      <Info label="Departure Time" value={new Date(ride.departure_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} />
                      <Info label="Est. Duration" value={ride.est_duration || '30 mins'} />
                      <Info label="Total Fare" value={`INR ${parseFloat(ride.fare_per_seat) * (parseInt(searchParams.seats, 10) || 1)}`} />
                    </div>
                    {ride.notes && (
                      <p className="text-xs text-slate-500 italic mt-3 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-50">
                        * Driver's note: {ride.notes}
                      </p>
                    )}
                    <Button 
                      onClick={() => handleBookRide(ride)} 
                      loading={bookingRideId === ride.id} 
                      className="w-full mt-4"
                      icon={CreditCard}
                    >
                      Pay & Confirm Seat
                    </Button>
                  </Card>
                ))
              ) : (
                <div className="rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
                  <p className="font-bold text-slate-600 text-lg">No matching commutes found</p>
                  <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">No other colleagues have scheduled rides on this day matching your route yet.</p>
                  <Button variant="secondary" className="mt-4" onClick={() => setStep('form')}>Refine Search Parameters</Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}

function RoutePanel({ title, text, route, action }) {
  return (
    <Card className="p-6 bg-white space-y-5">
      <div className="h-48 rounded-[2rem] bg-[#EAF6EF] p-4 relative overflow-hidden flex items-center justify-center border border-emerald-100">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#047857_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative w-full h-full rounded-2xl border-2 border-dashed border-emerald-200 bg-white/70 p-4 flex flex-col justify-between items-center shadow-sm">
          <div className="flex w-full items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              <MapPin className="h-3 w-3 text-emerald-700" /> Start
            </span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              <MapPin className="h-3 w-3 text-emerald-700" /> Finish
            </span>
          </div>
          <div className="w-full border-t-2 border-dashed border-emerald-300 relative my-2">
            <span className="absolute left-1/2 -top-3.5 -translate-x-1/2 bg-emerald-600 text-white rounded-full p-1.5 shadow-md shadow-emerald-600/30">
              <Car className="h-4 w-4" />
            </span>
          </div>
          <div className="flex w-full justify-between items-center text-xs font-bold text-slate-500">
            <span>{route ? `Distance: ${route.distance}` : 'Calculating routing...'}</span>
            <span>{route ? `Duration: ${route.duration}` : 'Geocoding path...'}</span>
          </div>
        </div>
      </div>
      <div>
        <h3 className="font-heading text-2xl font-extrabold text-slate-950">{title}</h3>
        <p className="mt-2 text-slate-600 text-sm leading-relaxed">{text}</p>
      </div>
      {action}
    </Card>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-emerald-700 tracking-wider">{label}</p>
      <p className="mt-1 font-bold text-slate-900">{value}</p>
    </div>
  );
}
