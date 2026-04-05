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

const FROM = process.env.SMTP_FROM ?? "PrijsMij <noreply@prijsmij.nl>";

function verificationSubject(lang: Lang) {
  const subjects: Record<Lang, string> = {
    nl: "Bevestig je e-mailadres — PrijsMij",
    en: "Verify your email address — PrijsMij",
    de: "E-Mail-Adresse bestätigen — PrijsMij",
    fr: "Confirmez votre adresse e-mail — PrijsMij",
  };
  return subjects[lang];
}

function verificationBody(name: string, link: string, lang: Lang) {
  const bodies: Record<Lang, string> = {
    nl: `Hoi ${name},\n\nBedankt voor het aanmelden bij PrijsMij! Klik op de onderstaande link om je e-mailadres te bevestigen:\n\n${link}\n\nDeze link is 24 uur geldig.\n\nMet vriendelijke groet,\nHet PrijsMij-team`,
    en: `Hi ${name},\n\nThank you for signing up at PrijsMij! Click the link below to verify your email address:\n\n${link}\n\nThis link is valid for 24 hours.\n\nBest regards,\nThe PrijsMij team`,
    de: `Hallo ${name},\n\nVielen Dank für Ihre Anmeldung bei PrijsMij! Klicken Sie auf den folgenden Link, um Ihre E-Mail-Adresse zu bestätigen:\n\n${link}\n\nDieser Link ist 24 Stunden lang gültig.\n\nMit freundlichen Grüßen,\nDas PrijsMij-Team`,
    fr: `Bonjour ${name},\n\nMerci de vous être inscrit sur PrijsMij ! Cliquez sur le lien ci-dessous pour confirmer votre adresse e-mail :\n\n${link}\n\nCe lien est valable 24 heures.\n\nCordialement,\nL'équipe PrijsMij`,
  };
  return bodies[lang];
}

function resetSubject(lang: Lang) {
  const subjects: Record<Lang, string> = {
    nl: "Wachtwoord opnieuw instellen — PrijsMij",
    en: "Reset your password — PrijsMij",
    de: "Passwort zurücksetzen — PrijsMij",
    fr: "Réinitialiser votre mot de passe — PrijsMij",
  };
  return subjects[lang];
}

function resetBody(name: string, link: string, lang: Lang) {
  const bodies: Record<Lang, string> = {
    nl: `Hoi ${name},\n\nWe hebben een verzoek ontvangen om je wachtwoord opnieuw in te stellen. Klik op de link hieronder:\n\n${link}\n\nDeze link is 1 uur geldig. Als jij dit niet hebt aangevraagd, kun je deze e-mail negeren.\n\nMet vriendelijke groet,\nHet PrijsMij-team`,
    en: `Hi ${name},\n\nWe received a request to reset your password. Click the link below:\n\n${link}\n\nThis link is valid for 1 hour. If you didn't request this, you can ignore this email.\n\nBest regards,\nThe PrijsMij team`,
    de: `Hallo ${name},\n\nWir haben eine Anfrage zum Zurücksetzen Ihres Passworts erhalten. Klicken Sie auf den folgenden Link:\n\n${link}\n\nDieser Link ist 1 Stunde lang gültig.\n\nMit freundlichen Grüßen,\nDas PrijsMij-Team`,
    fr: `Bonjour ${name},\n\nNous avons reçu une demande de réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous :\n\n${link}\n\nCe lien est valable 1 heure.\n\nCordialement,\nL'équipe PrijsMij`,
  };
  return bodies[lang];
}

export async function sendVerificationEmail(to: string, name: string, token: string, lang: Lang = "nl") {
  const baseUrl = process.env.APP_URL ?? "https://prijsmij.nl";
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

export async function sendNewBidNotification(to: string, consumerName: string, modelName: string, price: number, requestId: number) {
  const baseUrl = process.env.APP_URL ?? "https://prijsmij.nl";
  const link = `${baseUrl}/requests/${requestId}`;
  const subject = `Er is een bod geplaatst op je uitvraag — PrijsMij`;
  const text = `Hoi ${consumerName},\n\nGoed nieuws! Er is een bod geplaatst op je uitvraag.\n\nModel: ${modelName}\nPrijs: €${price.toFixed(2)}\n\nKlik op de onderstaande link om het bod te bekijken en te accepteren:\n\n${link}\n\nMet vriendelijke groet,\nHet PrijsMij-team`;

  const transporter = getTransporter();
  if (transporter) {
    await transporter.sendMail({ from: FROM, to, subject, text });
    console.log(`[EMAIL] New bid notification sent to ${to}`);
  } else {
    console.log(`[EMAIL-DEV] New bid notification for ${to}: ${link}`);
  }
}

export async function sendBuyerInterestNotification(to: string, storeName: string, consumerName: string, consumerEmail: string, requestTitle: string, requestId: number) {
  const baseUrl = process.env.APP_URL ?? "https://prijsmij.nl";
  const link = `${baseUrl}/requests/${requestId}`;
  const subject = `Een koper heeft interesse getoond in jouw bod — PrijsMij`;
  const text = `Hoi ${storeName},\n\n${consumerName} heeft interesse getoond in jouw bod op de uitvraag "${requestTitle}".\n\nContactgegevens koper:\nNaam: ${consumerName}\nE-mail: ${consumerEmail}\n\nBekijk de uitvraag:\n${link}\n\nVia PrijsMij kun je ook een connectie maken om direct contact op te nemen.\n\nMet vriendelijke groet,\nHet PrijsMij-team`;

  const transporter = getTransporter();
  if (transporter) {
    await transporter.sendMail({ from: FROM, to, subject, text });
    console.log(`[EMAIL] Buyer interest notification sent to ${to}`);
  } else {
    console.log(`[EMAIL-DEV] Buyer interest notification for ${to}: ${link}`);
  }
}

export async function sendNewRequestNotification(to: string, storeName: string, categoryName: string, requestTitle: string, requestId: number) {
  const baseUrl = process.env.APP_URL ?? "https://prijsmij.nl";
  const link = `${baseUrl}/requests/${requestId}`;
  const subject = `Nieuwe uitvraag in ${categoryName} — PrijsMij`;
  const text = `Hoi ${storeName},\n\nEr is een nieuwe uitvraag geplaatst in de categorie "${categoryName}" die jij volgt:\n\n"${requestTitle}"\n\nBekijk de uitvraag en plaats je bod:\n${link}\n\nMet vriendelijke groet,\nHet PrijsMij-team\n\n---\nJe ontvangt deze e-mail omdat je notificaties hebt ingesteld voor deze categorie. Beheer je voorkeuren via je dashboard.`;

  const transporter = getTransporter();
  if (transporter) {
    await transporter.sendMail({ from: FROM, to, subject, text });
    console.log(`[EMAIL] New request notification sent to ${to} for request ${requestId}`);
  } else {
    console.log(`[EMAIL-DEV] New request notification for ${to}: ${link}`);
  }
}

export async function sendAccountLockedEmail(to: string, name: string, attempts: number) {
  const subject = "Je account is tijdelijk geblokkeerd — PrijsMij";
  const text = `Hoi ${name},

Je account is tijdelijk geblokkeerd voor 15 minuten omdat er ${attempts} keer achter elkaar een verkeerd wachtwoord is ingevoerd.

Als jij dit bent geweest en je wachtwoord bent vergeten, kun je het opnieuw instellen via de "Wachtwoord vergeten" optie op de inlogpagina.

Als jij dit NIET bent geweest, raden we aan je wachtwoord zo snel mogelijk te wijzigen zodra de blokkering is opgeheven (na 15 minuten).

Met vriendelijke groet,
Het PrijsMij-team`;

  const transporter = getTransporter();
  if (transporter) {
    await transporter.sendMail({ from: FROM, to, subject, text });
    console.log(`[EMAIL] Account locked notification sent to ${to}`);
  } else {
    console.log(`[EMAIL-DEV] Account locked notification for ${to}:\n${text}`);
  }
}

export async function sendPasswordResetEmail(to: string, name: string, token: string, lang: Lang = "nl") {
  const baseUrl = process.env.APP_URL ?? "https://prijsmij.nl";
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
