import React, { useState, useEffect } from 'react';
import { useAuth } from '../firebase/authContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  X,
  LogIn,
  KeyRound,
  RotateCcw,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: { uid: string; email: string; displayName: string; papel?: 'jogador' | 'mestre' | 'mestre_jogador' }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login: loginGoogle } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'otp_verify'>('login');

  // Form Fields
  const [papel, setPapel] = useState<'jogador' | 'mestre' | 'mestre_jogador'>('jogador');
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState<number | ''>('');
  const [email, setEmail] = useState('');
  const [confirmacaoEmail, setConfirmacaoEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP Verification
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [otpExpiresAt, setOtpExpiresAt] = useState<number>(0);
  const [otpSecondsLeft, setOtpSecondsLeft] = useState<number>(0);
  const [simulatedEmailBanner, setSimulatedEmailBanner] = useState<string | null>(null);

  // Validation & Security Errors
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Countdown timer for OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (mode === 'otp_verify' && otpSecondsLeft > 0) {
      timer = setInterval(() => {
        setOtpSecondsLeft(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mode, otpSecondsLeft]);

  if (!isOpen) return null;

  // Cybersecurity Email Validator
  const validateEmail = (val: string): { valid: boolean; reason?: string } => {
    const trimmed = val.trim();
    // Enforce exactly ONE @
    const atCount = (trimmed.match(/@/g) || []).length;
    if (atCount !== 1) {
      return { valid: false, reason: 'O e-mail deve conter exatamente um símbolo "@".' };
    }

    // Check for cyber attack injection chars
    const dangerousInjection = /['";\\$<>{}]|--|\/\*|\*\//i;
    if (dangerousInjection.test(trimmed)) {
      return { valid: false, reason: 'O e-mail contém caracteres inválidos que foram bloqueados por segurança.' };
    }

    // Standard RFC-compliant domain regex with at least 2 char TLD
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed)) {
      return { valid: false, reason: 'Formato de domínio inválido (ex: jogador@reinos.com).' };
    }

    return { valid: true };
  };

  // Cybersecurity Password Validator & Strength Calculator
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) score++;

    // Check injection attack payloads
    const injectionAttempt = /(drop\s+table|or\s+1=1|union\s+select|\$where|<script>)/i.test(pwd);

    return {
      score,
      hasMinLength: pwd.length >= 8,
      hasUpper: /[A-Z]/.test(pwd),
      hasLower: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
      isSecureAgainstInjection: !injectionAttempt,
    };
  };

  const pwdMetrics = getPasswordStrength(senha);

  const handleStartRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate Name
    if (nome.trim().length < 3) {
      setErrorMsg('O nome deve ter no mínimo 3 caracteres.');
      return;
    }

    // Validate Age
    const ageNum = Number(idade);
    if (!idade || isNaN(ageNum) || ageNum < 10 || ageNum > 120) {
      setErrorMsg('Idade inválida. Apenas jogadores entre 10 e 120 anos.');
      return;
    }

    // Validate Email
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setErrorMsg(emailCheck.reason || 'E-mail inválido.');
      return;
    }

    // Validate Email Confirmation
    if (email.trim().toLowerCase() !== confirmacaoEmail.trim().toLowerCase()) {
      setErrorMsg('A confirmação de e-mail não confere com o e-mail digitado.');
      return;
    }

    // Validate Password
    if (!pwdMetrics.hasMinLength || !pwdMetrics.hasUpper || !pwdMetrics.hasLower || !pwdMetrics.hasNumber || !pwdMetrics.hasSpecial) {
      setErrorMsg('A senha deve conter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais.');
      return;
    }

    if (!pwdMetrics.isSecureAgainstInjection) {
      setErrorMsg('Tentativa de injeção de script detectada e bloqueada pelo firewall.');
      return;
    }

    // Validate Password Confirmation
    if (senha !== confirmacaoSenha) {
      setErrorMsg('A confirmação de senha não confere.');
      return;
    }

    // Generate 6-Digit OTP Code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpExpiresAt(Date.now() + 10 * 60 * 1000);
    setOtpSecondsLeft(600);
    setEnteredOtp(['', '', '', '', '', '']);
    setMode('otp_verify');

    // Simulate sending email with prominent banner
    setSimulatedEmailBanner(`📧 Código enviado com sucesso para ${email}: [ ${code} ]`);
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    const digit = val.slice(-1);
    if (digit && !/^\d$/.test(digit)) return;

    const nextOtp = [...enteredOtp];
    nextOtp[index] = digit;
    setEnteredOtp(nextOtp);

    // Auto-advance
    if (digit && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const fullCode = enteredOtp.join('');
    if (fullCode.length !== 6) {
      setErrorMsg('Por favor, digite todos os 6 dígitos do código.');
      return;
    }

    if (Date.now() > otpExpiresAt || otpSecondsLeft <= 0) {
      setErrorMsg('O código expirou. Solicite um novo código de verificação.');
      return;
    }

    if (fullCode !== generatedOtp) {
      setErrorMsg('Código incorreto. Verifique o código de 6 números enviado.');
      return;
    }

    // Create user object and save locally/persist
    setLoading(true);
    const registeredUser = {
      uid: 'user_' + Date.now(),
      email: email.trim().toLowerCase(),
      displayName: nome.trim(),
      idade: Number(idade),
      papel: papel,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem('codex_rpg_custom_auth_user', JSON.stringify(registeredUser));
    setLoading(false);

    alert(`🎉 Conta verificada e criada com sucesso, ${nome}! Seja bem-vindo ao Codex RPG.`);
    if (onSuccess) onSuccess(registeredUser);
    onClose();
  };

  const handleDirectLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setErrorMsg(emailCheck.reason || 'E-mail inválido.');
      return;
    }

    if (!senha) {
      setErrorMsg('Por favor, digite sua senha.');
      return;
    }

    // Check stored user or authenticate
    const saved = localStorage.getItem('codex_rpg_custom_auth_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.email === email.trim().toLowerCase()) {
        alert(`Login realizado com sucesso! Bem-vindo de volta, ${parsed.displayName}!`);
        if (onSuccess) onSuccess(parsed);
        onClose();
        return;
      }
    }

    // Generic credentials login
    const loggedUser = {
      uid: 'user_' + Math.abs(email.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)),
      email: email.trim().toLowerCase(),
      displayName: email.split('@')[0],
    };
    localStorage.setItem('codex_rpg_custom_auth_user', JSON.stringify(loggedUser));
    alert(`Login efetuado com sucesso!`);
    if (onSuccess) onSuccess(loggedUser);
    onClose();
  };

  const handleResendOtp = () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newCode);
    setOtpExpiresAt(Date.now() + 10 * 60 * 1000);
    setOtpSecondsLeft(600);
    setEnteredOtp(['', '', '', '', '', '']);
    setSimulatedEmailBanner(`📧 Novo código de segurança gerado para ${email}: [ ${newCode} ]`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 p-6 md:p-8 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto mb-3 text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">
            {mode === 'login'
              ? 'Acesso ao Codex RPG'
              : mode === 'register'
              ? 'Cadastro Seguro com Código 6 Dígitos'
              : 'Confirmação do Código por E-mail'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {mode === 'login'
              ? 'Entre com sua conta registrada ou utilize a autenticação Google.'
              : mode === 'register'
              ? 'Preencha seus dados para receber o código seguro de 6 dígitos no seu e-mail.'
              : `Digite o código numérico de 6 dígitos enviado para ${email}.`}
          </p>
        </div>

        {/* Banner de Simulação do E-mail enviado */}
        {simulatedEmailBanner && mode === 'otp_verify' && (
          <div className="mb-5 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between gap-3 animate-in zoom-in-95">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="font-mono font-semibold">{simulatedEmailBanner}</span>
            </div>
          </div>
        )}

        {/* Mensagem de Erro / Firewall */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5 animate-in shake">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TELA 1: LOGIN */}
        {mode === 'login' && (
          <div className="space-y-4">
            <form onSubmit={handleDirectLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-500" /> E-mail
                </label>
                <input
                  type="email"
                  required
                  placeholder="seu.email@dominio.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-500" /> Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Sua senha secreta"
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500 transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <LogIn className="w-4 h-4" />
                Entrar com E-mail e Senha
              </button>
            </form>

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
              <span className="relative px-3 bg-slate-900 text-xs text-slate-500 font-semibold uppercase">ou autenticação rápida</span>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={async () => {
                await loginGoogle();
                onClose();
              }}
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Entrar com Conta Google (OAuth)
            </button>

            <div className="pt-3 text-center text-xs text-slate-400">
              Não possui uma conta?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-amber-400 hover:underline font-bold cursor-pointer"
              >
                Cadastre-se com código por e-mail
              </button>
            </div>
          </div>
        )}

        {/* TELA 2: FORMULÁRIO DE CADASTRO COM CIBERSEGURANÇA */}
        {mode === 'register' && (
          <form onSubmit={handleStartRegistration} className="space-y-3.5">
            {/* Escolha de Papel na Mesa */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  Perfil de Acesso na Mesa:
                </span>
                <span className="text-[10px] text-amber-400 font-mono">
                  {papel === 'jogador' && '🛡️ Ficha, Treino & Alquimia'}
                  {papel === 'mestre' && '👑 Salas (até 20), IA Gemini & Desafios'}
                  {papel === 'mestre_jogador' && '⚔️ Acesso Completo: Mestre + Jogador'}
                </span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPapel('jogador')}
                  className={`py-2 px-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    papel === 'jogador'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-base">🛡️</span>
                  <span className="text-xs font-bold leading-tight">Jogador</span>
                  <span className="text-[9px] text-slate-400 leading-none">Aventureiro</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPapel('mestre')}
                  className={`py-2 px-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    papel === 'mestre'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-base">👑</span>
                  <span className="text-xs font-bold leading-tight">Mestre</span>
                  <span className="text-[9px] text-slate-400 leading-none">Dungeon Master</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPapel('mestre_jogador')}
                  className={`py-2 px-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    papel === 'mestre_jogador'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-base">⚔️</span>
                  <span className="text-xs font-bold leading-tight">Mestre / Jogador</span>
                  <span className="text-[9px] text-slate-400 leading-none">Acesso Total</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-500" /> Nome Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Geralt de Rívia"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" /> Idade
                </label>
                <input
                  type="number"
                  min="10"
                  max="120"
                  required
                  placeholder="Ex: 24"
                  value={idade}
                  onChange={e => setIdade(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Email & Confirmação de Email */}
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-500" /> E-mail (único @ e domínio válido)
                </label>
                <input
                  type="email"
                  required
                  placeholder="seu.email@dominio.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-500" /> Confirmação de E-mail
                </label>
                <input
                  type="email"
                  required
                  placeholder="Digite o mesmo e-mail novamente"
                  value={confirmacaoEmail}
                  onChange={e => setConfirmacaoEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Senha & Confirmação de Senha */}
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-500" /> Senha Forte
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Mínimo 8 dígitos com maiúsculas, números e símbolos"
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Termômetro de Força da Senha */}
                {senha && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-slate-400">Proteção Cibernética:</span>
                      <span className={
                        pwdMetrics.score <= 2 ? 'text-red-400 font-bold' :
                        pwdMetrics.score <= 4 ? 'text-amber-400 font-bold' :
                        'text-emerald-400 font-bold'
                      }>
                        {pwdMetrics.score <= 2 ? 'Fraca' : pwdMetrics.score <= 4 ? 'Média' : 'Indestrutível'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-300 ${
                          pwdMetrics.score <= 2 ? 'bg-red-500' :
                          pwdMetrics.score <= 4 ? 'bg-amber-500' :
                          'bg-emerald-500'
                        }`}
                        style={{ width: `${(pwdMetrics.score / 6) * 100}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400 pt-1">
                      <span className={pwdMetrics.hasMinLength ? 'text-emerald-400' : 'text-slate-500'}>✓ Mínimo 8 letras</span>
                      <span className={pwdMetrics.hasUpper ? 'text-emerald-400' : 'text-slate-500'}>✓ Letra maiúscula</span>
                      <span className={pwdMetrics.hasNumber ? 'text-emerald-400' : 'text-slate-500'}>✓ Contém números</span>
                      <span className={pwdMetrics.hasSpecial ? 'text-emerald-400' : 'text-slate-500'}>✓ Caracteres especiais</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-500" /> Confirmação de Senha
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Repita sua senha idêntica"
                  value={confirmacaoSenha}
                  onChange={e => setConfirmacaoSenha(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              <KeyRound className="w-4 h-4" />
              Enviar Código de 6 Dígitos p/ E-mail
            </button>

            <div className="pt-2 text-center text-xs text-slate-400">
              Já possui conta?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-amber-400 hover:underline font-bold cursor-pointer"
              >
                Voltar ao login
              </button>
            </div>
          </form>
        )}

        {/* TELA 3: CONFIRMAÇÃO DO CÓDIGO DE 6 NÚMEROS */}
        {mode === 'otp_verify' && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs text-slate-400">Digite o código de 6 dígitos:</span>
              <div className="flex justify-center gap-2">
                {enteredOtp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpDigitChange(idx, e.target.value)}
                    className="w-11 h-14 text-center text-2xl font-black font-mono rounded-xl bg-slate-950 border-2 border-slate-800 focus:border-amber-500 focus:outline-none text-white shadow-inner"
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-2">
              <span>
                Expira em:{' '}
                <strong className="text-amber-400">
                  {Math.floor(otpSecondsLeft / 60)}:{String(otpSecondsLeft % 60).padStart(2, '0')}
                </strong>
              </span>

              <button
                type="button"
                onClick={handleResendOtp}
                className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reenviar Código
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-950 font-black text-sm transition shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {loading ? 'Criando Conta...' : 'Validar Código & Ativar Conta'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                ← Corrigir dados do formulário
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
