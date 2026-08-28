import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
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
  Smartphone,
  Laptop,
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
    logout,
    cloudSyncStatus,
    syncLocalToCloudNow,
    isCloudSyncing,
  } = useAuth();

  const [mode, setMode] = useState<'cloud_login' | 'cloud_register' | 'demo_profiles'>('cloud_login');

  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCloudLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Por favor, informe seu e-mail e senha.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const ok = await login(email, password);
      if (ok) {
        setSuccessMsg('Conectado à nuvem com sucesso! Sincronização em tempo real ativada.');
        setTimeout(() => onClose(), 800);
      } else {
        setErrorMsg('E-mail ou senha incorretos.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao conectar à conta na nuvem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloudRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('Por favor, preencha nome, e-mail e senha.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('A senha precisa ter no mínimo 6 caracteres.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await register(name, email, password, storeName || undefined);
      setSuccessMsg('Conta criada com sucesso no banco de dados na nuvem!');
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao criar conta na nuvem.');
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
      setErrorMsg('Erro ao sincronizar dados locais com a nuvem.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">
                  Acesso & Sincronização em Nuvem
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  cloudSyncStatus === 'online'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {cloudSyncStatus === 'online' ? '🟢 Nuvem Ativa' : '🟡 Modo Local'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Acesse do celular e notebook simultaneamente com a mesma conta.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 py-2.5 bg-slate-950/50 border-b border-slate-800 flex space-x-2">
          <button
            onClick={() => {
              setMode('cloud_login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'cloud_login'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white bg-slate-800/40'
            }`}
          >
            Entrar na Nuvem
          </button>

          <button
            onClick={() => {
              setMode('cloud_register');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'cloud_register'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white bg-slate-800/40'
            }`}
          >
            Criar Nova Conta
          </button>

          <button
            onClick={() => {
              setMode('demo_profiles');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'demo_profiles'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white bg-slate-800/40'
            }`}
          >
            Perfis de Demonstração
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              {successMsg}
            </div>
          )}

          {/* Current Connected User Badge */}
          {currentUser && (
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    {currentUser.name}
                    <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded font-normal">
                      {currentUser.storeName || 'Revenda'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">{currentUser.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleManualSync}
                  disabled={isSubmitting || isCloudSyncing}
                  title="Sincronizar dados com a nuvem agora"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-colors text-xs flex items-center gap-1 font-bold"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCloudSyncing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Sincronizar</span>
                </button>

                <button
                  onClick={logout}
                  title="Desconectar"
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Multi-Device Feature Explainer Banner */}
          <div className="p-3.5 bg-gradient-to-r from-sky-950/40 to-slate-950 border border-sky-500/20 rounded-2xl flex items-center gap-3 text-xs text-sky-200">
            <div className="flex items-center gap-1 shrink-0 text-sky-400">
              <Smartphone className="w-4 h-4" />
              <span>↔</span>
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-white block">Acesso Multi-Dispositivo Ativo:</strong>
              Crie sua conta abaixo e faça login no seu celular e no notebook com o mesmo e-mail para ver seus produtos sincronizarem em tempo real.
            </div>
          </div>

          {/* MODE 1: CLOUD LOGIN */}
          {mode === 'cloud_login' && (
            <form onSubmit={handleCloudLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  E-mail da sua Conta *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Senha *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Sua senha secreta"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Conectando...
                  </>
                ) : (
                  <>
                    <Cloud className="w-4 h-4" /> Entrar & Sincronizar em Tempo Real
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 2: CLOUD REGISTER */}
          {mode === 'cloud_register' && (
            <form onSubmit={handleCloudRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Seu Nome Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Oliveira"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nome da Revenda / Garagem (Opcional)
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Ex: CO Brik & Negócios"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  E-mail para Acesso Multi-Dispositivo *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Crie uma Senha Segura (Mínimo 6 dígitos) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Criando Conta na Nuvem...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 stroke-[3]" /> Criar Conta e Sincronizar Banco de Dados
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 3: DEMO PROFILES */}
          {mode === 'demo_profiles' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Perfis Locais de Demonstração:
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
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-white">{user.name}</div>
                          <div className="text-[11px] text-slate-400">
                            {user.storeName || 'Revenda Independente'} • {user.email}
                          </div>
                        </div>
                      </div>

                      {isCurrent ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                          Conta Ativa
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 group-hover:text-white">
                          Acessar &rarr;
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
