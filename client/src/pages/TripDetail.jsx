import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MessageCircle, Phone, ShieldCheck, Play, CheckCircle, XCircle, Send, User } from 'lucide-react';
import PageShell from '../components/shared/PageShell.jsx';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import rideService from '../services/ride.service.js';
import toast from 'react-hot-toast';

export default function TripDetail() {
  const { tripId } = useParams();
  const { user } = useAuth();
  const socket = useSocket();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDriver, setIsDriver] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  
  const chatEndRef = useRef(null);

  // Fetch ride details
  const fetchRideDetails = async () => {
    try {
      setLoading(true);
      const data = await rideService.getRideById(tripId);
      setRide(data);
      setIsDriver(data.driver_id === user?.id);
    } catch (e) {
      toast.error('Failed to load ride details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRideDetails();
  }, [tripId, user]);

  // Handle socket connections and join chat room
  useEffect(() => {
    if (socket && ride) {
      // Join chat room
      socket.emit('join_ride_chat', ride.id);
      
      const handleNewMessage = (msg) => {
        setMessages((prev) => [...prev, msg]);
      };

      socket.on('new_message', handleNewMessage);

      return () => {
        socket.off('new_message', handleNewMessage);
      };
    }
  }, [socket, ride]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chatOpen]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !socket || !ride) return;

    const messagePayload = {
      rideId: ride.id,
      senderId: user.id,
      senderName: user.name,
      text: inputText.trim(),
      time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    };

    socket.emit('send_message', messagePayload);
    setInputText('');
  };

  // Driver action triggers
  const handleStartRide = async () => {
    try {
      const updated = await rideService.startRide(ride.id);
      setRide(updated);
      toast.success('Commute started! Passengers notified.');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to start ride.');
    }
  };

  const handleCompleteRide = async () => {
    try {
      const updated = await rideService.completeRide(ride.id);
      setRide(updated);
      toast.success('Commute completed! Thank you for pooling green.');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to complete ride.');
    }
  };

  const handleCancelRide = async () => {
    try {
      const updated = await rideService.cancelRide(ride.id);
      setRide(updated);
      toast.error('Commute cancelled.');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to cancel ride.');
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
      </div>
    );
  }

  if (!ride) {
    return (
      <PageShell title="Trip Not Found" description="The requested trip could not be resolved.">
        <Card className="p-8 text-center text-slate-500">
          <p>Please double check the address URL or return to dashboard.</p>
          <Link to="/my-trips">
            <Button className="mt-4">Back to My Trips</Button>
          </Link>
        </Card>
      </PageShell>
    );
  }

  const steps = ['Scheduled', 'Started', 'Completed'];
  const currentStepIndex = steps.indexOf(ride.ride_status);

  return (
    <PageShell 
      eyebrow="Trip detail" 
      title={`${ride.pickup_name} to ${ride.destination_name}`} 
      description={new Date(ride.departure_time).toLocaleString()}
      action={<Link to="/my-trips" className="font-bold text-emerald-700 hover:underline">Back to trips</Link>}
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card className="p-6 bg-white space-y-5">
            <div className="h-72 rounded-[2rem] bg-[#EAF6EF] p-5 relative overflow-hidden flex items-center justify-center border border-emerald-100">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#047857_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="relative w-full h-full rounded-2xl border-2 border-dashed border-emerald-300 bg-white/70 p-6 flex flex-col justify-between items-center shadow-sm">
                <span className="font-extrabold text-emerald-700 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-200 text-sm">
                  Active Ride Route Trace
                </span>
                <div className="w-full border-t-2 border-dashed border-emerald-400" />
                <div className="flex w-full justify-between items-center text-sm font-bold text-emerald-800">
                  <span>Distance: {ride.est_distance || 'Calculating...'}</span>
                  <span>Duration: {ride.est_duration || 'Calculating...'}</span>
                </div>
              </div>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <Info title="Commuter Role" value={isDriver ? 'Driver' : 'Passenger'} />
              <Info title="Vehicle Mode" value={ride.vehicle_model || 'Shared Car'} />
              <Info title="Plate Number" value={ride.vehicle_plate_number || 'N/A'} />
              <Info title="Fare per Seat" value={`INR ${ride.fare_per_seat}`} />
            </div>
            
            {/* Driver Controls */}
            {isDriver && ride.ride_status !== 'Completed' && ride.ride_status !== 'Cancelled' && (
              <Card className="p-4 bg-emerald-50 border border-emerald-100 rounded-3xl space-y-3">
                <p className="font-bold text-slate-800 text-sm">Driver Commute Actions:</p>
                <div className="flex flex-wrap gap-3">
                  {ride.ride_status === 'Scheduled' && (
                    <Button onClick={handleStartRide} icon={Play}>Start Ride</Button>
                  )}
                  {ride.ride_status === 'Started' && (
                    <Button onClick={handleCompleteRide} icon={CheckCircle}>Complete Ride</Button>
                  )}
                  <Button onClick={handleCancelRide} variant="danger" icon={XCircle}>Cancel Ride</Button>
                </div>
              </Card>
            )}
          </Card>

          {/* Real-time Socket.io Chat Module */}
          <Card className="p-6 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-xl font-extrabold text-slate-950 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-emerald-700" /> Trip Chat Room
              </h3>
              <Badge variant={chatOpen ? 'success' : 'secondary'}>Live Connected</Badge>
            </div>

            <div className="h-64 rounded-2xl border border-slate-100 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-400 text-sm italic">
                  No messages. Type below to say hi to your pool group!
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`flex flex-col max-w-[80%] rounded-2xl p-3 shadow-sm ${
                      msg.senderId === user.id 
                        ? 'self-end bg-emerald-600 text-white rounded-br-none' 
                        : 'self-start bg-white text-slate-900 border border-slate-100 rounded-bl-none'
                    }`}
                  >
                    <span className="text-[10px] opacity-75 font-bold mb-0.5">{msg.senderName}</span>
                    <p className="text-sm font-medium leading-relaxed break-words">{msg.text}</p>
                    <span className="text-[9px] opacity-50 text-right mt-1">{msg.time}</span>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Type a message to your co-passengers..." 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
              />
              <Button onClick={handleSendMessage} icon={Send} />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-white space-y-6">
            <div className="flex items-center justify-between">
              <Badge variant={ride.ride_status === 'Completed' ? 'success' : 'warning'}>
                {ride.ride_status}
              </Badge>
              <Button variant="secondary" icon={Phone}>Contact Driver</Button>
            </div>
            
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step} className="flex gap-3">
                  <span className={`mt-1.5 h-3.5 w-3.5 rounded-full shrink-0 ${currentStepIndex >= index ? 'bg-emerald-600 ring-4 ring-emerald-100' : 'bg-emerald-100'}`} />
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{step}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {index === 0 && 'Ride scheduled on platform.'}
                      {index === 1 && 'Driver has started GPS tracking.'}
                      {index === 2 && 'Trip finished successfully.'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-800 flex gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
              <span>Employee verified commute trip with workspace mask encryption.</span>
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}

function Info({ title, value }) {
  return (
    <div className="rounded-2xl border border-emerald-100 p-4">
      <p className="text-xs font-bold uppercase text-emerald-700 tracking-wider">{title}</p>
      <p className="mt-1 font-bold text-slate-950 truncate">{value}</p>
    </div>
  );
}
