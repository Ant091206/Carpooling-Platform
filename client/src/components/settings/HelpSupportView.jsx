import { useState } from 'react';
import { HelpCircle, MessageSquare, ChevronDown, ChevronUp, Mail, Phone, ShieldCheck, ArrowRight } from 'lucide-react';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import toast from 'react-hot-toast';

export default function HelpSupportView() {
  const [openFaq, setOpenFaq] = useState(null);
  const [supportMessage, setSupportMessage] = useState('');

  const faqs = [
    {
      q: 'How does enterprise carpooling work?',
      a: 'Verified employees of the organization offer seats in their personal commute vehicles or book empty seats with colleagues traveling along similar routes.'
    },
    {
      q: 'Is payment processed automatically?',
      a: 'Yes, you can pay using your Enterprise In-App Wallet, UPI, Cards, or Cash. Wallet payments automatically debit upon trip completion.'
    },
    {
      q: 'What if a driver or passenger cancels the trip?',
      a: 'If a trip is cancelled, full refunds are automatically processed back to the passenger wallet immediately.'
    },
    {
      q: 'How is driver & vehicle safety verified?',
      a: 'All drivers must register active vehicles with verified registration plates, insurance, and company employee IDs before publishing rides.'
    }
  ];

  const handleSendSupportMessage = () => {
    if (!supportMessage.trim()) return;
    toast.success('Support inquiry sent! A representative will respond within 2 hours.');
    setSupportMessage('');
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-emerald-900 text-white space-y-4 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-700/60 rounded-2xl">
            <MessageSquare className="h-6 w-6 text-emerald-200" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-extrabold">Enterprise Commute Support Desk</h3>
            <p className="text-xs text-emerald-200">Need instant assistance with bookings, payments, or live trip tracking?</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-800/60 border border-emerald-700 space-y-3">
          <p className="text-xs font-medium leading-relaxed">Direct support chat shortcut connects you with corporate transport desk support:</p>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Ask support a quick question..." 
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendSupportMessage()}
              className="flex-1 rounded-xl bg-emerald-950/80 border border-emerald-700 px-4 py-2.5 text-xs text-white placeholder-emerald-400 focus:outline-none focus:border-emerald-400"
            />
            <Button onClick={handleSendSupportMessage} variant="secondary" icon={ArrowRight}>Chat Shortcut</Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-white border border-slate-100 space-y-4">
        <h3 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-emerald-600" /> Frequently Asked Questions
        </h3>

        <div className="divide-y divide-slate-100">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className="py-3">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full text-left font-bold text-slate-800 text-sm flex items-center justify-between py-1 hover:text-emerald-700"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-emerald-600" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>
                {isOpen && (
                  <p className="text-xs text-slate-600 leading-relaxed mt-2 pl-2 border-l-2 border-emerald-500">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <Card className="p-4 bg-white border border-slate-100 flex items-center gap-3">
          <Mail className="h-5 w-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold text-slate-900 block">Email Support</span>
            <span className="text-slate-500">support@carpooling-enterprise.internal</span>
          </div>
        </Card>
        <Card className="p-4 bg-white border border-slate-100 flex items-center gap-3">
          <Phone className="h-5 w-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold text-slate-900 block">Helpline Number</span>
            <span className="text-slate-500">+1-800-CARPOOL-HELP</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
