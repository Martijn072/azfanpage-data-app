
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Lock, Mail, User, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const { signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    return {
      isValid: minLength && hasUpper && hasLower && hasNumber,
      requirements: {
        minLength,
        hasUpper,
        hasLower,
        hasNumber,
      }
    };
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    if (!formData.email || !formData.password) {
      setErrors({ general: 'Vul alle velden in' });
      setIsLoading(false);
      return;
    }

    const { error } = await signIn(formData.email, formData.password);
    
    if (error) {
      setErrors({ general: error.message });
    } else {
      onClose();
      setFormData({ email: '', password: '', confirmPassword: '', displayName: '' });
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) newErrors.email = 'Email is verplicht';
    if (!formData.password) newErrors.password = 'Wachtwoord is verplicht';
    if (!formData.displayName) newErrors.displayName = 'Naam is verplicht';
    
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = 'Wachtwoord voldoet niet aan de eisen';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Wachtwoorden komen niet overeen';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    const { error } = await signUp(formData.email, formData.password, formData.displayName);
    
    if (error) {
      setErrors({ general: error.message });
    } else {
      onClose();
      setFormData({ email: '', password: '', confirmPassword: '', displayName: '' });
    }
    
    setIsLoading(false);
  };

  const passwordValidation = validatePassword(formData.password);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-center text-az-black dark:text-white flex items-center justify-center gap-2">
            <Shield className="w-5 h-5 text-az-red" />
            AZ Fanpage Account
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-premium-gray-100 dark:bg-gray-700">
            <TabsTrigger 
              value="signin" 
              className="data-[state=active]:bg-az-red data-[state=active]:text-white"
            >
              Inloggen
            </TabsTrigger>
            <TabsTrigger 
              value="signup"
              className="data-[state=active]:bg-az-red data-[state=active]:text-white"
            >
              Registreren
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4 mt-4">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email" className="text-premium-gray-700 dark:text-gray-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-premium-gray-400 w-4 h-4" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="je@email.nl"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 bg-white dark:bg-gray-700 border-premium-gray-300 dark:border-gray-600 focus:border-az-red"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password" className="text-premium-gray-700 dark:text-gray-300">
                  Wachtwoord
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-premium-gray-400 w-4 h-4" />
                  <Input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10 bg-white dark:bg-gray-700 border-premium-gray-300 dark:border-gray-600 focus:border-az-red"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-premium-gray-400 hover:text-az-red"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {errors.general && (
                <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">
                  {errors.general}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-az-red hover:bg-red-700 text-white"
              >
                {isLoading ? 'Bezig...' : 'Inloggen'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 mt-4">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-premium-gray-700 dark:text-gray-300">
                  Naam
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-premium-gray-400 w-4 h-4" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Je naam"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="pl-10 bg-white dark:bg-gray-700 border-premium-gray-300 dark:border-gray-600 focus:border-az-red"
                    required
                  />
                </div>
                {errors.displayName && (
                  <p className="text-red-600 dark:text-red-400 text-sm">{errors.displayName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-premium-gray-700 dark:text-gray-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-premium-gray-400 w-4 h-4" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="je@email.nl"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 bg-white dark:bg-gray-700 border-premium-gray-300 dark:border-gray-600 focus:border-az-red"
                    required
                  />
                </div>
                {errors.email && (
                  <p className="text-red-600 dark:text-red-400 text-sm">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-premium-gray-700 dark:text-gray-300">
                  Wachtwoord
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-premium-gray-400 w-4 h-4" />
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10 bg-white dark:bg-gray-700 border-premium-gray-300 dark:border-gray-600 focus:border-az-red"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-premium-gray-400 hover:text-az-red"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {formData.password && (
                  <div className="text-xs space-y-1">
                    <div className={`flex items-center gap-1 ${passwordValidation.requirements.minLength ? 'text-green-600' : 'text-red-600'}`}>
                      <div className={`w-2 h-2 rounded-full ${passwordValidation.requirements.minLength ? 'bg-green-600' : 'bg-red-600'}`}></div>
                      Minimaal 8 tekens
                    </div>
                    <div className={`flex items-center gap-1 ${passwordValidation.requirements.hasUpper ? 'text-green-600' : 'text-red-600'}`}>
                      <div className={`w-2 h-2 rounded-full ${passwordValidation.requirements.hasUpper ? 'bg-green-600' : 'bg-red-600'}`}></div>
                      Hoofdletter
                    </div>
                    <div className={`flex items-center gap-1 ${passwordValidation.requirements.hasLower ? 'text-green-600' : 'text-red-600'}`}>
                      <div className={`w-2 h-2 rounded-full ${passwordValidation.requirements.hasLower ? 'bg-green-600' : 'bg-red-600'}`}></div>
                      Kleine letter
                    </div>
                    <div className={`flex items-center gap-1 ${passwordValidation.requirements.hasNumber ? 'text-green-600' : 'text-red-600'}`}>
                      <div className={`w-2 h-2 rounded-full ${passwordValidation.requirements.hasNumber ? 'bg-green-600' : 'bg-red-600'}`}></div>
                      Cijfer
                    </div>
                  </div>
                )}
                
                {errors.password && (
                  <p className="text-red-600 dark:text-red-400 text-sm">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-premium-gray-700 dark:text-gray-300">
                  Bevestig wachtwoord
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-premium-gray-400 w-4 h-4" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10 bg-white dark:bg-gray-700 border-premium-gray-300 dark:border-gray-600 focus:border-az-red"
                    required
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-600 dark:text-red-400 text-sm">{errors.confirmPassword}</p>
                )}
              </div>

              {errors.general && (
                <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">
                  {errors.general}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || !passwordValidation.isValid}
                className="w-full bg-az-red hover:bg-red-700 text-white disabled:opacity-50"
              >
                {isLoading ? 'Bezig...' : 'Account aanmaken'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="text-xs text-premium-gray-500 dark:text-gray-400 text-center mt-4">
          Door een account aan te maken ga je akkoord met onze huisregels en privacy policy.
        </div>
      </DialogContent>
    </Dialog>
  );
};
