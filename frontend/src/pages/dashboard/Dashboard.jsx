import React from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Car, Navigation, Wallet, Leaf, ArrowRight } from 'lucide-react';

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Good morning, John</h1>
          <p className="text-slate-500">Here's your carpooling overview for today.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Navigation className="w-4 h-4" />
            Find Ride
          </Button>
          <Button className="gap-2">
            <Car className="w-4 h-4" />
            Offer Ride
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Trips" value="24" icon={Car} trend="+12%" />
        <StatCard title="Distance Travelled" value="342 km" icon={Navigation} trend="+5%" />
        <StatCard title="Money Saved" value="$120.50" icon={Wallet} trend="+18%" />
        <StatCard title="Carbon Saved" value="45 kg" icon={Leaf} trend="+22%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Upcoming Ride</h2>
            <button className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
              View details <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between border border-slate-100">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                MK
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Downtown Office to Home</h3>
                <p className="text-sm text-slate-500">Today, 5:30 PM • with Mike Ross</p>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-slate-900">Confirmed</div>
              <div className="text-sm text-slate-500">Toyota Camry</div>
            </div>
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Wallet Balance</h2>
          <div className="text-3xl font-bold text-slate-900 mb-2">$42.50</div>
          <p className="text-sm text-slate-500 mb-4">Available for your next rides</p>
          <Button fullWidth variant="outline">Top Up Wallet</Button>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend }) {
  return (
    <Card className="flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
          {trend}
        </span>
      </div>
      <div>
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      </div>
    </Card>
  );
}
