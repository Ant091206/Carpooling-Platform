import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Building2, MapPin, Phone } from 'lucide-react';
import AuthLayout from './AuthLayout.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const onSubmit = () => {
    toast.success('Profile saved. You are ready to carpool.');
    navigate('/dashboard');
  };

  return (
    <AuthLayout title="Set up your profile" subtitle="Add the commute details colleagues need before sharing a ride.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input icon={Phone} label="Phone number" placeholder="+91 98765 43210" error={errors.phone?.message} {...register('phone', { required: 'Phone number is required' })} />
        <Input icon={Building2} label="Department" placeholder="Product Engineering" error={errors.department?.message} {...register('department', { required: 'Department is required' })} />
        <Input icon={MapPin} label="Default pickup area" placeholder="Indiranagar" error={errors.pickup?.message} {...register('pickup', { required: 'Default pickup is required' })} />
        <Button type="submit" className="w-full" size="lg">Save Profile</Button>
      </form>
    </AuthLayout>
  );
}
