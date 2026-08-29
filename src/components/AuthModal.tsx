import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';
import {
  User as UserIcon,
  X,
  Lock,
  Mail,
  Building,
  ShieldCheck,
  CheckCircle,
  Users,
  LogOut,
  Plus,
  Cloud,
  RefreshCw,
  AlertTriangle,
  KeyRound,
  ArrowLeft,
  Eye,
  EyeOff,
  Check,
  Send,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    users,
    loginAs,
    register,
    login,
    requestPasswordReset,
    resetPasswordWithCode,
    logout,
    cloudSyncStatus,
    syncLocalToCloudNow,
    isCloudSyncing,
  } = useAuth();

  const [mode, setMode] = useState<'cloud_login' | 'cloud_register' | 'forgot_password' | 'demo_profiles'>('cloud_login');

  // Form fields
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copyDemoData, setCopyDemoData] = useState(false);

  // Recovery fields
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [recoveryStep, setRecoveryStep] = useState<'request' | 'verify'>('request');
  const [sentCodeHint, setSentCodeHint] = useState<string | null>(null);

  // Status & Feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Check if an email already exists in the system
  const isEmailAlreadyRegistered = (checkEmail: string) => {
    if (!checkEmail || !checkEmail.includes('@')) return false;
    const normalized = checkEmail.trim().toLowerCase();
    return users.some((u) => u.email.trim().toLowerCase() === normalized);
  };

  const handleCloudLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Por favor, informe seu e-mail e sua senha.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);
    try {
      const ok = await login(email.trim(), password);
      if (ok) {
        setSuccessMsg('Conectado com sucesso! Sincronização em tempo real ativada.');
        setTimeout(() => onClose(), 800);
      } else {
        setErrorMsg('E-mail ou senha incorretos. Verifique suas credenciais.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao conectar à conta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloudRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanStore = storeName.trim();

    if (!cleanName) {
      setErrorMsg('Por favor, informe o seu Nome Completo.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Por favor, informe um endereço de e-mail válido.');
      return;
    }
    if (!password) {
      setErrorMsg('Por favor, crie uma senha de acesso.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('A senha precisa ter no mínimo 6 caracteres para garantir a segurança.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('As senhas digitadas não coincidem. Verifique a confirmação de senha.');
      return;
    }

    // Duplicate account prevention check
    if (isEmailAlreadyRegistered(cleanEmail)) {
      setErrorMsg('Este e-mail já possui uma conta cadastrada no sistema. Por favor, acesse a aba "Entrar" ou utilize a "Recuperação de Senha".');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);
    try {
      const newUser = await register(
        cleanName,
        cleanEmail,
        password,
        cleanStore || undefined,
        undefined,
        copyDemoData
      );
      setSuccessMsg(`Conta "${newUser.name}" criada com sucesso! Seu banco de dados independente e isolado está ativo.`);
      setTimeout(() => onClose(), 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao criar conta no banco de dados.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = (recoveryEmail || email).trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Por favor, digite o e-mail cadastrado para enviarmos as instruções.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);
    try {
      const res = await requestPasswordReset(cleanEmail);
      setRecoveryEmail(cleanEmail);
      if (res.verificationCode) {
        setSentCodeHint(res.verificationCode);
      }
      setRecoveryStep('verify');
      setSuccessMsg(`Código e instruções de recuperação enviados com sucesso para ${cleanEmail}! Verifique sua caixa de entrada e spam.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao processar solicitação de recuperação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = recoveryEmail.trim().toLowerCase();
    const cleanCode = recoveryCode.trim();

    if (!cleanCode) {
      setErrorMsg('Por favor, informe o código de 6 dígitos que você recebeu.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg('A confirmação da nova senha não confere. Digite a mesma senha nos dois campos.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);
    try {
      await resetPasswordWithCode(cleanEmail, cleanCode, newPassword);
      setSuccessMsg('Senha redefinida com sucesso! Você já está conectado à sua conta.');
      setTimeout(() => onClose(), 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Código de verificação incorreto ou expirado. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSync = async () => {
    setIsSubmitting(true);
    const ok = await syncLocalToCloudNow();
    setIsSubmitting(false);
    if (ok) {
      setSuccessMsg('Dados sincronizados com o banco na nuvem com sucesso!');
    } else {
      setErrorMsg('Erro ao sincronizar dados com a nuvem.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                {mode === 'cloud_login' && 'Entrar na Conta'}
                {mode === 'cloud_register' && 'Cadastrar Nova Conta'}
                {mode === 'forgot_password' && 'Recuperação de Senha'}
                {mode === 'demo_profiles' && 'Perfis e Contas'}
              </h2>
              <p className="text-xs text-slate-400">
                {mode === 'cloud_login' && 'Acesse seus dados e estoque com sincronização em nuvem'}
                {mode === 'cloud_register' && 'Crie sua conta exclusiva para ter banco de dados isolado'}
                {mode === 'forgot_password' && 'Receba um código no seu e-mail para redefinir sua senha'}
                {mode === 'demo_profiles' && 'Selecione ou alterne entre contas cadastradas'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1 shrink-0 overflow-x-auto">
          <button
            onClick={() => {
              setMode('cloud_login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              mode === 'cloud_login'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Entrar</span>
          </button>

          <button
            onClick={() => {
              setMode('cloud_register');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              mode === 'cloud_register'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Criar Conta</span>
          </button>

          <button
            onClick={() => {
              setMode('forgot_password');
              setRecoveryStep('request');
              setErrorMsg('');
              setSuccessMsg('');
              if (email) setRecoveryEmail(email);
            }}
            className={`py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              mode === 'forgot_password'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Recuperar Senha</span>
          </button>

          <button
            onClick={() => {
              setMode('demo_profiles');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              mode === 'demo_profiles'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Perfis ({users.length})</span>
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* Current Active User Banner */}
          {currentUser && (
            <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shrink-0 shadow-md">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                    <span>Conta Ativa no Momento</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  </div>
                  <div className="font-black text-sm text-white truncate">{currentUser.name}</div>
                  <div className="text-xs text-slate-400 truncate">{currentUser.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isCloudSyncing}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Sincronizar dados agora"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCloudSyncing ? 'animate-spin text-amber-400' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setSuccessMsg('Sessão encerrada com sucesso.');
                  }}
                  className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Desconectar"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <div className="flex-1 leading-relaxed">{successMsg}</div>
            </div>
          )}

          {/* ========================================================= */}
          {/* MODE 1: ENTRAR NA CONTA (LOGIN) */}
          {/* ========================================================= */}
          {mode === 'cloud_login' && (
            <div className="space-y-4">
              <form onSubmit={handleCloudLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Seu E-mail Cadastrado *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="seu.email@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-300">
                      Sua Senha *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot_password');
                        setRecoveryStep('request');
                        setRecoveryEmail(email);
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer underline underline-offset-2"
                    >
                      Esqueceu sua senha?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Conectando à Conta...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" /> Entrar na Minha Conta
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Callout to register */}
              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl text-center space-y-2">
                <div className="text-xs text-slate-400">
                  Ainda não possui uma conta cadastrada no Autobrick?
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMode('cloud_register');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
                >
                  <Plus className="w-4 h-4 text-amber-400" /> Criar Conta Gratuita e Independente
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* MODE 2: CRIAR NOVA CONTA (CADASTRO COMPLETO COM VALIDAÇÃO) */}
          {/* ========================================================= */}
          {mode === 'cloud_register' && (
            <div className="space-y-4">
              <form onSubmit={handleCloudRegister} className="space-y-3">
                {/* Nome Completo */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Seu Nome Completo *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Oliveira"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Nome da Empresa / Loja */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nome da Empresa / Loja ou Negócio (Opcional)
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Ex: Auto Brick Multimarcas"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                {/* E-mail */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-300">
                      Seu E-mail *
                    </label>
                    {email && isEmailAlreadyRegistered(email) && (
                      <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                        E-mail já cadastrado
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="seu.email@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                        email && isEmailAlreadyRegistered(email)
                          ? 'border-rose-500 focus:border-rose-400'
                          : 'border-slate-700 focus:border-amber-500'
                      }`}
                    />
                  </div>
                  {email && isEmailAlreadyRegistered(email) && (
                    <p className="text-[11px] text-rose-400 mt-1">
                      Este e-mail já possui uma conta cadastrada. Use a aba "Entrar" ou recupere sua senha.
                    </p>
                  )}
                </div>

                {/* Senha */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Crie uma Senha Segura (Mínimo 6 caracteres) *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirmar Senha */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Confirme a sua Senha *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Repita a mesma senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                        confirmPassword && password !== confirmPassword
                          ? 'border-rose-500 focus:border-rose-400'
                          : 'border-slate-700 focus:border-amber-500'
                      }`}
                    />
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-[11px] text-rose-400 mt-1">
                      As senhas não conferem.
                    </p>
                  )}
                </div>

                {/* Iniciar com dados de teste */}
                <label className="flex items-start gap-2.5 p-3 bg-slate-950/70 border border-slate-800 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={copyDemoData}
                    onChange={(e) => setCopyDemoData(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-amber-400"
                  />
                  <div className="text-[11px] text-slate-300 leading-tight">
                    <strong className="text-amber-400 block mb-0.5">Iniciar com exemplos de estoque e clientes</strong>
                    Se marcado, copia modelos de teste. Se desmarcado, a conta inicia 100% limpa.
                  </div>
                </label>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || (Boolean(email) && isEmailAlreadyRegistered(email))}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Criando Conta & Isolando Banco...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 stroke-[3]" /> Cadastrar Conta no Autobrick
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Back to login */}
              <div className="text-center pt-1 pb-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('cloud_login');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-xs text-slate-400 hover:text-amber-400 font-medium cursor-pointer transition-colors"
                >
                  Já tem uma conta cadastrada? <span className="text-amber-400 font-bold underline">Entrar agora</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* MODE 3: RECUPERAÇÃO DE SENHA */}
          {/* ========================================================= */}
          {mode === 'forgot_password' && (
            <div className="space-y-4">
              {recoveryStep === 'request' ? (
                /* STEP 1: SOLICITAR CÓDIGO */
                <form onSubmit={handleRequestPasswordReset} className="space-y-3.5">
                  <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl space-y-1.5">
                    <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4" />
                      <span>Instruções de Recuperação</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Digite o e-mail que você cadastrou no sistema. Enviaremos um <strong>código de verificação de 6 dígitos</strong> e as instruções para você redefinir sua senha com segurança.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      E-mail Cadastrado *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="seu.email@exemplo.com"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Enviando Código de Recuperação...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> Enviar Código para meu E-mail
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('cloud_login');
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Voltar para a tela de Login
                    </button>
                  </div>
                </form>
              ) : (
                /* STEP 2: VERIFICAR CÓDIGO E DEFINIR NOVA SENHA */
                <form onSubmit={handleResetPassword} className="space-y-3.5">
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-2xl space-y-2">
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" />
                      <span>Código de Recuperação Enviado!</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Enviamos as instruções e o código de 6 dígitos para o e-mail: <strong className="text-white">{recoveryEmail}</strong>.
                    </p>
                    {sentCodeHint && (
                      <div className="bg-slate-950/80 p-2 rounded-xl border border-emerald-500/40 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">Código de Verificação:</span>
                        <span className="font-mono text-sm font-black text-amber-400 tracking-widest">{sentCodeHint}</span>
                      </div>
                    )}
                  </div>

                  {/* Código de 6 Dígitos */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Código de Verificação de 6 Dígitos *
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="Ex: 742918"
                        value={recoveryCode}
                        onChange={(e) => setRecoveryCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono tracking-widest text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Nova Senha */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Crie sua Nova Senha (Mínimo 6 caracteres) *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirmar Nova Senha */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Confirme a Nova Senha *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="Repita a nova senha"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Atualizando Senha...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" /> Redefinir Senha e Entrar na Conta
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setRecoveryStep('request')}
                      className="text-xs text-slate-400 hover:text-amber-400 cursor-pointer"
                    >
                      Reenviar para outro e-mail
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('cloud_login');
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      className="text-xs text-slate-400 hover:text-white cursor-pointer"
                    >
                      Voltar ao Login
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* MODE 4: PERFIS CADASTRADOS */}
          {/* ========================================================= */}
          {mode === 'demo_profiles' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Contas Registradas no Sistema:
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Isolamento RLS Ativo
                </span>
              </div>

              <div className="space-y-2.5">
                {users.map((user) => {
                  const isCurrent = currentUser?.id === user.id;
                  return (
                    <div
                      key={user.id}
                      onClick={() => {
                        loginAs(user);
                        onClose();
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isCurrent
                          ? 'bg-amber-500/10 border-amber-500 text-white shadow-md'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isCurrent
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-white">{user.name}</div>
                          <div className="text-[11px] text-slate-400">
                            {user.storeName || 'Loja / Negócios'} • {user.email}
                          </div>
                        </div>
                      </div>

                      {isCurrent ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 shadow-sm">
                          Conta Ativa
                        </span>
                      ) : (
                        <span className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1">
                          Acessar &rarr;
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('cloud_register');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
                >
                  <Plus className="w-4 h-4 text-amber-400" /> Cadastrar Outra Conta
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
