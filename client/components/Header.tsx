import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage, languageInfo } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, User, LogOut, Settings, Languages, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Header: React.FC = () => {
  const { user, login, register, logout, connectWallet } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(loginForm);

    if (result.success) {
      setIsAuthDialogOpen(false);
      setLoginForm({ email: "", password: "" });
      toast.success("Successfully logged in!");
    } else {
      toast.error(result.error || "Login failed");
    }

    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    const result = await register({
      email: registerForm.email,
      password: registerForm.password,
    });

    if (result.success) {
      setIsAuthDialogOpen(false);
      setRegisterForm({ email: "", password: "", confirmPassword: "" });
      toast.success("Account created successfully!");
    } else {
      toast.error(result.error || "Registration failed");
    }

    setIsLoading(false);
  };

  const handleConnectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts.length > 0) {
          const success = await connectWallet(accounts[0]);
          if (success) {
            toast.success("Wallet connected successfully!");
          } else {
            toast.error("Failed to connect wallet");
          }
        }
      } catch (error) {
        toast.error("Failed to connect MetaMask");
      }
    } else {
      toast.error("MetaMask is not installed");
    }
  };

  return (
    <header className="bg-black shadow-lg border-b border-gray-800 relative pt-safe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 pt-2 sm:pt-0">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F402154b5f0d94c8e8de8b82354390da9%2F1efa9d49721f44139fbd3c83fab3a610?format=png"
                alt="World Jackpot Logo"
                className="h-24 w-auto cursor-pointer hover:opacity-90 transition-opacity duration-200 drop-shadow-2xl filter brightness-110 contrast-110 saturate-110 animate-pulse"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(218, 165, 32, 0.8)) drop-shadow(0 0 40px rgba(255, 215, 0, 0.5)) drop-shadow(0 0 60px rgba(184, 134, 11, 0.3))',
                  animation: 'pulse 2s infinite'
                }}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/"
                className="text-white hover:text-black hover:bg-amber-500 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200"
              >
                {t('nav.tickets')}
              </Link>

              <Link
                to="/gewinnzahlen"
                className="text-white hover:text-black hover:bg-amber-500 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200"
              >
                {t('nav.winningNumbers')}
              </Link>
              {user && (
                <Link
                  to="/meine-scheine"
                  className="text-white hover:text-black hover:bg-amber-500 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200"
                >
                  {t('nav.myTickets')}
                </Link>
              )}
              <a
                href="#"
                className="text-white hover:text-black hover:bg-amber-500 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200"
              >
                {t('nav.help')}
              </a>
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-black hover:bg-amber-500"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-white hover:text-black hover:bg-amber-500">
                  <Languages className="h-4 w-4" />
                  <span className="text-lg">{languageInfo[language].flag}</span>
                  <span className="text-xs uppercase">{language}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
                {Object.entries(languageInfo).map(([langCode, info]) => (
                  <DropdownMenuItem
                    key={langCode}
                    onClick={() => setLanguage(langCode as any)}
                    className="flex items-center space-x-2"
                  >
                    <span className="text-base">{info.flag}</span>
                    <span>{info.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {user ? (
              <div className="flex items-center space-x-4">
                {user.isAdmin && (
                  <Link to="/admin">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex items-center space-x-2 bg-black hover:bg-gray-800 text-white"
                    >
                      <Settings className="h-4 w-4" />
                      <span>{t('nav.adminPanel')}</span>
                    </Button>
                  </Link>
                )}

                <div className="text-sm">
                  <span className="text-white">{t('nav.balance')}: </span>
                  <span className="font-bold text-green-800">
                    {user.balance.toFixed(2)}€
                  </span>
                </div>

                {!user.walletAddress && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleConnectWallet}
                    className="flex items-center space-x-2 border-amber-400 bg-amber-500 text-black hover:bg-amber-600 hover:text-black"
                  >
                    <Wallet className="h-4 w-4" />
                    <span>{t('nav.connectWallet')}</span>
                  </Button>
                )}

                {user.walletAddress && (
                  <div className="text-xs text-gray-300">
                    Wallet: {user.walletAddress.slice(0, 6)}...
                    {user.walletAddress.slice(-4)}
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-white" />
                  <span className="text-sm text-white">{user.email}</span>
                </div>

                <Button variant="ghost" size="sm" onClick={logout} className="text-white hover:text-black hover:bg-amber-500">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Dialog
                open={isAuthDialogOpen}
                onOpenChange={setIsAuthDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-amber-500 hover:bg-amber-600 text-black">{t('nav.login')}</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{t('nav.login')}</DialogTitle>
                  </DialogHeader>

                  <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
                      <TabsTrigger value="register">{t('auth.register')}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="login-email">{t('auth.email')}</Label>
                          <Input
                            id="login-email"
                            type="email"
                            value={loginForm.email}
                            onChange={(e) =>
                              setLoginForm({
                                ...loginForm,
                                email: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="login-password">{t('auth.password')}</Label>
                          <Input
                            id="login-password"
                            type="password"
                            value={loginForm.password}
                            onChange={(e) =>
                              setLoginForm({
                                ...loginForm,
                                password: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={isLoading}
                        >
                          {isLoading ? t('auth.loggingIn') : t('auth.login')}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="register">
                      <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="register-email">{t('auth.email')}</Label>
                          <Input
                            id="register-email"
                            type="email"
                            value={registerForm.email}
                            onChange={(e) =>
                              setRegisterForm({
                                ...registerForm,
                                email: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-password">{t('auth.password')}</Label>
                          <Input
                            id="register-password"
                            type="password"
                            value={registerForm.password}
                            onChange={(e) =>
                              setRegisterForm({
                                ...registerForm,
                                password: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-confirm-password">
                            {t('auth.confirmPassword')}
                          </Label>
                          <Input
                            id="register-confirm-password"
                            type="password"
                            value={registerForm.confirmPassword}
                            onChange={(e) =>
                              setRegisterForm({
                                ...registerForm,
                                confirmPassword: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={isLoading}
                        >
                          {isLoading ? t('auth.registering') : t('auth.register')}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black border-t border-gray-700 absolute top-full left-0 right-0 z-50 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block text-white hover:text-black hover:bg-amber-500 px-3 py-2 rounded-md text-base font-medium transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.tickets')}
            </Link>
            <Link
              to="/gewinnzahlen"
              className="block text-white hover:text-black hover:bg-amber-500 px-3 py-2 rounded-md text-base font-medium transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.winningNumbers')}
            </Link>
            {user && (
              <Link
                to="/meine-scheine"
                className="block text-white hover:text-black hover:bg-amber-500 px-3 py-2 rounded-md text-base font-medium transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.myTickets')}
              </Link>
            )}
            <a
              href="#"
              className="block text-white hover:text-black hover:bg-amber-500 px-3 py-2 rounded-md text-base font-medium transition-all duration-200"
            >
              {t('nav.help')}
            </a>

            {/* Mobile User Section */}
            <div className="border-t border-gray-700 pt-4 mt-4">
              {/* Language Selector */}
              <div className="px-3 py-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Language:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{languageInfo[language].flag}</span>
                    <span className="text-xs uppercase text-white">{language}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {Object.entries(languageInfo).slice(0, 6).map(([langCode, info]) => (
                    <Button
                      key={langCode}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLanguage(langCode as any);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`text-xs border-amber-400 text-white hover:bg-amber-500 hover:text-black ${language === langCode ? 'bg-amber-600 text-black' : 'bg-gray-800'}`}
                    >
                      <span className="mr-1">{info.flag}</span>
                      {langCode.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>

              {user ? (
                <div className="space-y-2">
                  {user.isAdmin && (
                    <Link
                      to="/admin"
                      className="block text-white hover:text-black hover:bg-amber-500 px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 inline mr-2" />
                      {t('nav.adminPanel')}
                    </Link>
                  )}

                  <div className="px-3 py-2 text-white">
                    <div className="text-sm">
                      <span>{t('nav.balance')}: </span>
                      <span className="font-bold text-green-400">
                        {user.balance.toFixed(2)}€
                      </span>
                    </div>
                    <div className="text-sm mt-1">
                      <User className="h-4 w-4 inline mr-1" />
                      {user.email}
                    </div>
                  </div>

                  {!user.walletAddress && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleConnectWallet}
                      className="mx-3 mb-2 border-amber-400 bg-amber-500 text-black hover:bg-amber-600 hover:text-black"
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      <span>{t('nav.connectWallet')}</span>
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="mx-3 mb-2 text-white hover:text-black hover:bg-amber-500 w-auto"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="px-3 py-2">
                  <Dialog
                    open={isAuthDialogOpen}
                    onOpenChange={setIsAuthDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        className="w-full bg-amber-500 hover:bg-amber-600 text-black"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {t('nav.login')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>{t('nav.login')}</DialogTitle>
                      </DialogHeader>

                      <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
                          <TabsTrigger value="register">{t('auth.register')}</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                          <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="mobile-login-email">{t('auth.email')}</Label>
                              <Input
                                id="mobile-login-email"
                                type="email"
                                value={loginForm.email}
                                onChange={(e) =>
                                  setLoginForm({
                                    ...loginForm,
                                    email: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="mobile-login-password">{t('auth.password')}</Label>
                              <Input
                                id="mobile-login-password"
                                type="password"
                                value={loginForm.password}
                                onChange={(e) =>
                                  setLoginForm({
                                    ...loginForm,
                                    password: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <Button
                              type="submit"
                              className="w-full"
                              disabled={isLoading}
                            >
                              {isLoading ? t('auth.loggingIn') : t('auth.login')}
                            </Button>
                          </form>
                        </TabsContent>

                        <TabsContent value="register">
                          <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="mobile-register-email">{t('auth.email')}</Label>
                              <Input
                                id="mobile-register-email"
                                type="email"
                                value={registerForm.email}
                                onChange={(e) =>
                                  setRegisterForm({
                                    ...registerForm,
                                    email: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="mobile-register-password">{t('auth.password')}</Label>
                              <Input
                                id="mobile-register-password"
                                type="password"
                                value={registerForm.password}
                                onChange={(e) =>
                                  setRegisterForm({
                                    ...registerForm,
                                    password: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="mobile-register-confirm-password">
                                {t('auth.confirmPassword')}
                              </Label>
                              <Input
                                id="mobile-register-confirm-password"
                                type="password"
                                value={registerForm.confirmPassword}
                                onChange={(e) =>
                                  setRegisterForm({
                                    ...registerForm,
                                    confirmPassword: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <Button
                              type="submit"
                              className="w-full"
                              disabled={isLoading}
                            >
                              {isLoading ? t('auth.registering') : t('auth.register')}
                            </Button>
                          </form>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
