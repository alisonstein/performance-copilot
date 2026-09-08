// ============================================================================
// Traduz mensagens de erro do Supabase Auth (em inglês) para mensagens
// amigáveis em português. Nunca expor stack trace ou mensagem técnica crua
// para o usuário final.
// ============================================================================

const KNOWN_ERRORS: Array<{ match: RegExp; message: string }> = [
  { match: /invalid login credentials/i, message: "E-mail ou senha incorretos." },
  { match: /email not confirmed/i, message: "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada." },
  { match: /user already registered/i, message: "Já existe uma conta com este e-mail. Tente entrar." },
  { match: /password should be at least/i, message: "A senha deve ter pelo menos 6 caracteres." },
  { match: /unable to validate email address/i, message: "Informe um e-mail válido." },
  { match: /rate limit/i, message: "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente." },
  { match: /network/i, message: "Não foi possível conectar. Verifique sua internet e tente novamente." },
];

export function translateAuthError(rawMessage: string | undefined | null): string {
  if (!rawMessage) return "Não foi possível concluir a operação. Tente novamente.";

  for (const { match, message } of KNOWN_ERRORS) {
    if (match.test(rawMessage)) return message;
  }

  return "Não foi possível concluir a operação. Tente novamente em instantes.";
}
