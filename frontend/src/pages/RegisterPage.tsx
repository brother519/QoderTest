import { Link, useNavigate } from 'react-router-dom';
import { RegisterForm } from '../components/auth/RegisterForm';

export function RegisterPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>
        <RegisterForm onSuccess={() => navigate('/dashboard')} />
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
