import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MessageCircle, Phone, Mail, ShieldCheck, Play, CheckCircle, Navigation, Send, User, Car, Calendar, Clock, AlertTriangle } from 'lucide-react';
import PageShell from '../components/shared/PageShell.jsx';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import LiveTrackingMap from '../components/maps/LiveTrackingMap.jsx';
import tripService from '../services/trip.service.js';
import toast from 'react-hot-toast';

export default function TripDetail() {
  const { tripId } = useParams();
  const { user } = useAuth();
  const socket = useSocket();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDriver, setIsDriver] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [typingUser, setTypingUser] = useState(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callStatus, setCallStatus] = useState('Initiating encrypted voice call...');
  
  const chatEndRef = useRef(null);

  // Fetch trip details
  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      const data = await tripService.getTrip(tripId);
      setTrip(data);
      setIsDriver(data.driverId === user?.id);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load trip details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripDetails();
  }, [tripId, user]);

  // Handle socket connections, chat room, history and voice calls
  useEffect(() => {
    if (socket && trip) {
      socket.emit('join_ride_chat', trip.rideId);
      
      const handleHistory = (history) => {
        setMessages(history);
      };

      const handleNewMessage = (msg) => {
        setMessages((prev) => [...prev, msg]);
      };

      const handleUserTyping = ({ userName }) => {
        setTypingUser(userName);
      };

      const handleUserStopTyping = () => {
        setTypingUser(null);
      };

      const handleIncomingCall = ({ callerName }) => {
        setCallStatus(`Incoming call from ${callerName}...`);
        setShowCallModal(true);
      };

      socket.on('chat_history', handleHistory);
      socket.on('new_message', handleNewMessage);
      socket.on('user_typing', handleUserTyping);
      socket.on('user_stop_typing', handleUserStopTyping);
      socket.on('voice_call_incoming', handleIncomingCall);

      return () => {
        socket.off('chat_history', handleHistory);
        socket.off('new_message', handleNewMessage);
        socket.off('user_typing', handleUserTyping);
        socket.off('user_stop_typing', handleUserStopTyping);
        socket.off('voice_call_incoming', handleIncomingCall);
      };
    }
  }, [socket, trip]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !socket || !trip) return;

    const messagePayload = {
      rideId: trip.rideId,
      senderId: user.id,
      senderName: user.name,
      text: inputText.trim(),
      time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    };

    socket.emit('send_message', messagePayload);
    setInputText('');
  };

  // Driver action triggers
  const handleStartTrip = async () => {
    try {
      const updated = await tripService.startTrip(trip.id);
      setTrip(prev => ({ ...prev, status: updated.status, startedAt: updated.startedAt }));
      toast.success('Trip started! Passenger has been notified.');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to start trip.');
    }
  };

  const handleUpdateProgress = async () => {
    try {
      const updated = await tripService.updateTripProgress(trip.id);
      setTrip(prev => ({ ...prev, status: updated.status }));
      toast.success('Trip progress updated to IN PROGRESS!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update progress.');
    }
  };

  const handleCompleteTrip = async () => {
    try {
      const updated = await tripService.completeTrip(trip.id);
      setTrip(prev => ({ ...prev, status: updated.status, completedAt: updated.completedAt }));
      toast.success('Trip completed! Thank you for sharing your ride.');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to complete trip.');
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
      </div>
    );
  }

  if (!trip) {
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

  // Define steps matching BOOKED -> ACCEPTED -> STARTED -> IN_PROGRESS -> COMPLETED
  const steps = ['BOOKED', 'ACCEPTED', 'STARTED', 'IN_PROGRESS', 'COMPLETED'];
  // Since Trip record is created when accepted, if status is BOOKED or ACCEPTED, we set appropriate index
  const currentStepIndex = steps.indexOf(trip.status);

  return (
    <PageShell 
      eyebrow="Trip detail" 
      title={`${trip.ride.pickupName} to ${trip.ride.destinationName}`} 
      description={new Date(trip.ride.departureTime).toLocaleString()}
      action={<Link to="/my-trips" className="font-bold text-emerald-700 hover:underline">Back to trips</Link>}
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          {/* Card containing Ride, Driver, Passenger and Vehicle details */}
          <Card className="p-6 bg-white space-y-6">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h3 className="font-heading text-lg font-bold text-slate-900">Ride Details</h3>
                <div className="flex gap-2">
                  <Badge variant={trip.status === 'CANCELLED' ? 'danger' : 'success'}>
                    Trip: {trip.status}
                  </Badge>
                  <Badge variant={trip.booking.status === 'CANCELLED' ? 'danger' : 'warning'}>
                    Booking: {trip.booking.status}
                  </Badge>
                </div>
              </div>

              {/* Ride Details Block */}
              <div className="grid gap-4 sm:grid-cols-2 bg-slate-50 p-4 rounded-3xl mb-4 border border-slate-100">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-emerald-700 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Departure Date</span>
                    <span className="text-sm font-bold text-slate-800">{new Date(trip.ride.departureTime).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-emerald-700 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Departure Time</span>
                    <span className="text-sm font-bold text-slate-800">
                      {new Date(trip.ride.departureTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-emerald-700 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Seats Booked</span>
                    <span className="text-sm font-bold text-slate-800">{trip.booking.requestedSeats} Seat(s)</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-700 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Paid Fare</span>
                    <span className="text-sm font-bold text-emerald-800">
                      INR {(parseFloat(trip.ride.farePerSeat) * trip.booking.requestedSeats).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Roles details (Driver & Passenger) */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="border border-slate-100 p-4 rounded-3xl space-y-2">
                  <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Driver Information</p>
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" /> {trip.driver.name}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400" /> {trip.driver.email}
                  </p>
                  {trip.driver.phone && (
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400" /> {trip.driver.phone}
                    </p>
                  )}
                </div>

                <div className="border border-slate-100 p-4 rounded-3xl space-y-2">
                  <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Passenger Information</p>
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" /> {trip.passenger.name}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400" /> {trip.passenger.email}
                  </p>
                  {trip.passenger.phone && (
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400" /> {trip.passenger.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="mt-4 border border-slate-100 p-4 rounded-3xl space-y-2 bg-emerald-50/20">
                <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Car className="h-4 w-4" /> Vehicle Information
                </p>
                {trip.vehicle ? (
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block font-bold">Model</span>
                      <span className="font-bold text-slate-800">{trip.vehicle.model}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold">Plate Number</span>
                      <span className="font-bold text-slate-800">{trip.vehicle.plateNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold">Color</span>
                      <span className="font-bold text-slate-800">{trip.vehicle.color}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No specific vehicle vehicle information registered.</p>
                )}
              </div>
            </div>
            
            {/* Driver Controls */}
            {isDriver && trip.status !== 'COMPLETED' && trip.status !== 'CANCELLED' && (
              <Card className="p-4 bg-emerald-50 border border-emerald-100 rounded-3xl space-y-3">
                <p className="font-bold text-slate-800 text-sm">Driver Commute Actions:</p>
                <div className="flex flex-wrap gap-3">
                  {trip.status === 'ACCEPTED' && (
                    <Button onClick={handleStartTrip} icon={Play}>Start Trip</Button>
                  )}
                  {trip.status === 'STARTED' && (
                    <>
                      <Button onClick={handleUpdateProgress} variant="secondary" icon={Navigation}>Set In Progress</Button>
                      <Button onClick={handleCompleteTrip} icon={CheckCircle}>Complete Trip</Button>
                    </>
                  )}
                  {trip.status === 'IN_PROGRESS' && (
                    <Button onClick={handleCompleteTrip} icon={CheckCircle}>Complete Trip</Button>
                  )}
                </div>
              </Card>
            )}
          </Card>

          {/* Live Google Maps Route Tracking Component */}
          <LiveTrackingMap 
            pickupName={trip.ride.pickupName}
            destinationName={trip.ride.destinationName}
            status={trip.status}
          />

          {/* Real-time Socket.io Chat Module */}
          <Card className="p-6 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-xl font-extrabold text-slate-950 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-emerald-700" /> Trip Chat Room
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCallStatus(`Calling ${isDriver ? trip.passenger.name : trip.driver.name}...`);
                    setShowCallModal(true);
                    if (socket) {
                      socket.emit('voice_call_initiate', { rideId: trip.rideId, callerId: user.id, callerName: user.name });
                    }
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-100 text-emerald-800 px-3 py-1.5 text-xs font-bold transition hover:bg-emerald-200"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>Voice Call</span>
                </button>
                <Badge variant="success">Live Connected</Badge>
              </div>
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
              {typingUser && (
                <div className="text-[10px] text-emerald-700 font-bold italic animate-pulse">
                  {typingUser} is typing...
                </div>
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

        {/* Timeline column */}
        <div className="space-y-6">
          <Card className="p-6 bg-white space-y-6">
            <h3 className="font-heading text-lg font-bold text-slate-900">Trip Timeline</h3>

            {trip.status === 'CANCELLED' ? (
              <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-xs font-bold text-red-800 flex gap-2">
                <AlertTriangle className="h-4 w-4 text-red-700 shrink-0" />
                <span>This trip has been cancelled and cannot be modified.</span>
              </div>
            ) : (
              <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {steps.map((step, index) => {
                  const isCompletedStep = currentStepIndex >= index;
                  return (
                    <div key={step} className="flex gap-4 relative">
                      <span className={`h-4.5 w-4.5 rounded-full shrink-0 border-2 z-10 flex items-center justify-center transition-all ${
                        isCompletedStep 
                          ? 'bg-emerald-600 border-emerald-600 ring-4 ring-emerald-50' 
                          : 'bg-white border-slate-200'
                      }`}>
                        {isCompletedStep && (
                          <span className="w-1.5 h-1.5 bg-white rounded-full" />
                        )}
                      </span>
                      <div>
                        <p className={`font-bold text-sm transition-all ${isCompletedStep ? 'text-emerald-800' : 'text-slate-400'}`}>
                          {step}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {step === 'BOOKED' && 'Passenger booking request submitted.'}
                          {step === 'ACCEPTED' && 'Booking accepted by driver.'}
                          {step === 'STARTED' && (trip.startedAt ? `Trip started at ${new Date(trip.startedAt).toLocaleTimeString()}` : 'Driver has started the trip.')}
                          {step === 'IN_PROGRESS' && 'Trip is currently in progress.'}
                          {step === 'COMPLETED' && (trip.completedAt ? `Trip completed at ${new Date(trip.completedAt).toLocaleTimeString()}` : 'Trip completed successfully.')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-800 flex gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
              <span>Employee verified commute trip with workspace mask encryption.</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Voice Call Modal Overlay */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 text-white p-8 text-center space-y-6 shadow-2xl border border-slate-800">
            <div className="relative mx-auto h-20 w-20 rounded-full bg-emerald-600/30 p-4 flex items-center justify-center animate-pulse">
              <Phone className="h-10 w-10 text-emerald-400 animate-bounce" />
            </div>

            <div>
              <h4 className="font-heading text-lg font-extrabold text-white">Voice Call Session</h4>
              <p className="text-xs text-emerald-400 mt-1">{callStatus}</p>
              <p className="text-[10px] text-slate-400 mt-3">Encrypted employee peer-to-peer audio channel</p>
            </div>

            <div className="flex justify-center gap-4 pt-2">
              <button 
                onClick={() => {
                  setShowCallModal(false);
                  if (socket) socket.emit('voice_call_end', { rideId: trip.rideId });
                  toast.success('Voice call ended');
                }}
                className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-xs font-bold text-white shadow-lg hover:bg-red-700 transition"
              >
                <Phone className="h-4 w-4 rotate-[135deg]" />
                End Call
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

