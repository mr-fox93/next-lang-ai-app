import { ResetPasswordForm } from '@/components/auth';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      {/* Modal container */}
      <div className="relative z-10">
        <ResetPasswordForm />
      </div>
    </div>
  );
} 