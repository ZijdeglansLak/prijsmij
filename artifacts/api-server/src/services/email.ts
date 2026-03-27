import nodemailer from "nodemailer";

type Lang = "nl" | "en" | "de" | "fr";

function getTransporter() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
  }
  return null;
}

const FROM = process.env.SMTP_FROM ?? "BestBod <noreply@bestbod.nl>";

function verificationSubject(lang: Lang) {
  const subjects: Record<Lang, string> = {
    nl: "Bevestig je e-mailadres — BestBod",
    en: "Verify your email address — BestBod",
    de: "E-Mail-Adresse bestätigen — BestBod",
    fr: "Confirmez votre adresse e-mail — BestBod",
  };
  return subjects[lang];
}

function verificationBody(name: string, link: string, lang: Lang) {
  const bodies: Record<Lang, string> = {
    nl: `Hoi ${name},\n\nBedankt voor het aanmelden bij BestBod! Klik op de onderstaande link om je e-mailadres te bevestigen:\n\n${link}\n\nDeze link is 24 uur geldig.\n\nMet vriendelijke groet,\nHet BestBod-team`,
    en: `Hi ${name},\n\nThank you for signing up at BestBod! Click the link below to verify your email address:\n\n${link}\n\nThis link is valid for 24 hours.\n\nBest regards,\nThe BestBod team`,
    de: `Hallo ${name},\n\nVielen Dank für Ihre Anmeldung bei BestBod! Klicken Sie auf den folgenden Link, um Ihre E-Mail-Adresse zu bestätigen:\n\n${link}\n\nDieser Link ist 24 Stunden lang gültig.\n\nMit freundlichen Grüßen,\nDas BestBod-Team`,
    fr: `Bonjour ${name},\n\nMerci de vous être inscrit sur BestBod ! Cliquez sur le lien ci-dessous pour confirmer votre adresse e-mail :\n\n${link}\n\nCe lien est valable 24 heures.\n\nCordialement,\nL'équipe BestBod`,
  };
  return bodies[lang];
}

function resetSubject(lang: Lang) {
  const subjects: Record<Lang, string> = {
    nl: "Wachtwoord opnieuw instellen — BestBod",
    en: "Reset your password — BestBod",
    de: "Passwort zurücksetzen — BestBod",
    fr: "Réinitialiser votre mot de passe — BestBod",
  };
  return subjects[lang];
}

function resetBody(name: string, link: string, lang: Lang) {
  const bodies: Record<Lang, string> = {
    nl: `Hoi ${name},\n\nWe hebben een verzoek ontvangen om je wachtwoord opnieuw in te stellen. Klik op de link hieronder:\n\n${link}\n\nDeze link is 1 uur geldig. Als jij dit niet hebt aangevraagd, kun je deze e-mail negeren.\n\nMet vriendelijke groet,\nHet BestBod-team`,
    en: `Hi ${name},\n\nWe received a request to reset your password. Click the link below:\n\n${link}\n\nThis link is valid for 1 hour. If you didn't request this, you can ignore this email.\n\nBest regards,\nThe BestBod team`,
    de: `Hallo ${name},\n\nWir haben eine Anfrage zum Zurücksetzen Ihres Passworts erhalten. Klicken Sie auf den folgenden Link:\n\n${link}\n\nDieser Link ist 1 Stunde lang gültig.\n\nMit freundlichen Grüßen,\nDas BestBod-Team`,
    fr: `Bonjour ${name},\n\nNous avons reçu une demande de réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous :\n\n${link}\n\nCe lien est valable 1 heure.\n\nCordialement,\nL'équipe BestBod`,
  };
  return bodies[lang];
}

export async function sendVerificationEmail(to: string, name: string, token: string, lang: Lang = "nl") {
  const baseUrl = process.env.APP_URL ?? "https://bestbod.nl";
  const link = `${baseUrl}/auth/verify-email?token=${token}`;
  const subject = verificationSubject(lang);
  const text = verificationBody(name, link, lang);

  const transporter = getTransporter();
  if (transporter) {
    await transporter.sendMail({ from: FROM, to, subject, text });
    console.log(`[EMAIL] Verification email sent to ${to}`);
  } else {
    console.log(`[EMAIL-DEV] Verification link for ${to}: ${link}`);
  }
  return link;
}

export async function sendPasswordResetEmail(to: string, name: string, token: string, lang: Lang = "nl") {
  const baseUrl = process.env.APP_URL ?? "https://bestbod.nl";
  const link = `${baseUrl}/auth/reset-password?token=${token}`;
  const subject = resetSubject(lang);
  const text = resetBody(name, link, lang);

  const transporter = getTransporter();
  if (transporter) {
    await transporter.sendMail({ from: FROM, to, subject, text });
    console.log(`[EMAIL] Password reset email sent to ${to}`);
  } else {
    console.log(`[EMAIL-DEV] Reset link for ${to}: ${link}`);
  }
  return link;
}
