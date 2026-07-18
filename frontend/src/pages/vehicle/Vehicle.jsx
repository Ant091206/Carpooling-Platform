import React from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { PlusCircle, Car } from 'lucide-react';

export function Vehicle() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Vehicles</h1>
          <p className="text-slate-500">Manage vehicles you use for carpooling.</p>
        </div>
        <Button className="gap-2">
          <PlusCircle className="w-4 h-4" /> Add Vehicle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-primary-500 relative">
          <div className="absolute top-4 right-4 bg-primary-100 text-primary-700 text-xs font-bold px-2 py-1 rounded-full">
            Default
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Toyota Camry</h3>
              <p className="text-sm text-slate-500">Silver • 2021</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm border-y border-slate-100 py-3">
            <div>
              <span className="block text-slate-500">License Plate</span>
              <span className="font-medium text-slate-900">ABC-1234</span>
            </div>
            <div>
              <span className="block text-slate-500">Seats Available</span>
              <span className="font-medium text-slate-900">4</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">Edit</Button>
            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">Remove</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
