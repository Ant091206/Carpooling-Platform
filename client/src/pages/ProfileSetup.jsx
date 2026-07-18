import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Building2, Phone, Upload, User, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import authService from '../services/auth.service.js';
import AuthLayout from './AuthLayout.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

const profileSetupSchema = z.object({
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  phone: z.string().min(5, 'Phone number is required')
});

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      department: user?.department || '',
      designation: user?.designation || '',
      phone: user?.phone || ''
    }
  });

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setUploading(true);
    try {
      const response = await authService.uploadAvatar(formData);
      setAvatarUrl(response.avatarUrl);
      toast.success('Commute avatar uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Avatar upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data) => {
    // Add avatar if updated
    const payload = { ...data };
    if (avatarUrl) {
      payload.avatar = avatarUrl;
    }

    const res = await updateProfile(payload);
    if (res.success) {
      toast.success('Your profile setup is complete!');
      navigate('/dashboard');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <AuthLayout title="Complete your profile" subtitle="Customize details that colleagues see when sharing a ride.">
      <div className="flex flex-col items-center gap-4 mb-6">
        <div className="relative group">
          <div className="h-28 w-28 rounded-full border-4 border-emerald-100 overflow-hidden bg-slate-50 flex items-center justify-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <User className="h-12 w-12 text-slate-300" />
            )}
          </div>
          <label className="absolute bottom-0 right-0 p-2 bg-emerald-600 rounded-full text-white cursor-pointer hover:bg-emerald-700 shadow-lg">
            <Upload className="h-4 w-4" />
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploading} />
          </label>
        </div>
        {uploading && <p className="text-xs text-slate-500 animate-pulse">Uploading photo...</p>}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input 
          icon={Phone} 
          label="Direct Phone Number" 
          placeholder="+91 98765 43210" 
          error={errors.phone?.message} 
          {...register('phone')} 
        />
        <Input 
          icon={Building2} 
          label="Corporate Department" 
          placeholder="Product Development" 
          error={errors.department?.message} 
          {...register('department')} 
        />
        <Input 
          icon={Building2} 
          label="Designation/Job Title" 
          placeholder="Senior Associate" 
          error={errors.designation?.message} 
          {...register('designation')} 
        />
        
        <Button type="submit" className="w-full mt-6" size="lg">Ready to Commute</Button>
      </form>
    </AuthLayout>
  );
}
