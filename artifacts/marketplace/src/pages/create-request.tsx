import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { useListCategories, useGetCategoryById, useCreateRequest } from "@workspace/api-client-react";
import type { CreateRequestBodyAllowedOfferTypesItem } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/contexts/i18n";
import { useUserAuth } from "@/contexts/user-auth";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check, Sparkles, LogIn } from "lucide-react";
import { EmailVerificationBanner } from "@/components/email-verification-banner";
import { Link } from "wouter";

export default function CreateRequest() {
  const [step, setStep] = useState(1);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t, lang } = useI18n();
  const { user, isLoggedIn, isSeller } = useUserAuth();

  const { data: categories } = useListCategories();
  const { data: categoryDetail } = useGetCategoryById(categoryId!, { query: { enabled: !!categoryId }});
  const createMutation = useCreateRequest();

  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [specs, setSpecs] = useState<Record<string, string>>({});
  const [allowedOffers, setAllowedOffers] = useState<CreateRequestBodyAllowedOfferTypesItem[]>(['new']);
  const [allowSimilar, setAllowSimilar] = useState(false);
  const [consumerName, setConsumerName] = useState(() => user?.contactName ?? "");
  const [consumerEmail, setConsumerEmail] = useState(() => user?.email ?? "");

  useEffect(() => {
    if (user) {
      setConsumerName(user.contactName);
      setConsumerEmail(user.email);
    }
  }, [user]);

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (!categoryId) return;
    try {
      const result = await createMutation.mutateAsync({
        data: {
          title,
          brand,
          description,
          categoryId,
          specifications: specs,
          allowedOfferTypes: allowedOffers,
          allowSimilarModels: allowSimilar,
          consumerName,
          consumerEmail
        }
      });
      toast({ title: t.create.success, description: t.create.successDesc });
      setLocation(`/requests/${result.id}`);
    } catch {
      toast({ title: t.general.error, description: t.create.errorDesc, variant: "destructive" });
    }
  };

  const toggleOfferType = (type: CreateRequestBodyAllowedOfferTypesItem) => {
    setAllowedOffers(prev =>
      prev.includes(type) ? prev.filter(x => x !== type) : [...prev, type]
    );
  };

  const offerTypeLabel = (type: string) => {
    if (type === 'new') return t.bid.new;
    if (type === 'refurbished') return t.bid.refurbished;
    if (type === 'occasion') return t.bid.occasion;
    return type;
  };

  if (!isLoggedIn) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-primary/10 flex items-center justify-center mb-6">
              <LogIn className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-secondary mb-3">Inloggen vereist</h2>
            <p className="text-muted-foreground mb-8">
              Om een uitvraag te plaatsen heb je een account nodig. Log in of maak een gratis account aan.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/login">
                <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-8">
                  Inloggen
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="outline" className="w-full sm:w-auto px-8">
                  Account aanmaken
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (user && !user.emailVerified) {
    return <Layout><EmailVerificationBanner /></Layout>;
  }

  if (isSeller) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <p className="text-muted-foreground mb-4">Winkeliers kunnen geen uitvragen plaatsen.</p>
            <Link href="/requests">
              <Button variant="outline">Bekijk uitvragen</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-secondary text-white py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-extrabold mb-4 text-white">{t.create.title}</h1>
          <div className="flex justify-center items-center gap-4 mt-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${step >= i ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white/10 text-white/50'}`}>
                  {step > i ? <Check className="w-5 h-5" /> : i}
                </div>
                {i < 3 && <div className={`w-16 h-1 rounded-full ${step > i ? 'bg-primary' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {/* STEP 1 */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl font-bold mb-6 text-center">{t.create.step1Title}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {categories?.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setCategoryId(cat.id); handleNext(); }}
                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 ${categoryId === cat.id ? 'border-primary bg-primary/5 shadow-md' : 'border-border bg-card hover:border-primary/30'}`}
                  >
                    <div className="text-4xl">{cat.icon}</div>
                    <span className="font-bold text-secondary">{cat.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 2 && categoryDetail && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl font-bold mb-6">{t.create.step2TitleFor} {categoryDetail.name}</h2>
              <div className="space-y-6 bg-card p-8 rounded-2xl border border-border shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold mb-2">{t.create.titleLabel} *</label>
                    <Input placeholder={t.create.titlePlaceholder} value={title} onChange={e => setTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">{t.create.brandLabel} *</label>
                    <Input placeholder={t.create.brandPlaceholder} value={brand} onChange={e => setBrand(e.target.value)} />
                  </div>
                </div>

                {categoryDetail.fields.map((field: any) => {
                  const fieldLabel = field.labelI18n?.[lang] || field.label;
                  const fieldPlaceholder = field.placeholderI18n?.[lang] || field.placeholder;
                  return (
                  <div key={field.key}>
                    {field.type === 'boolean' ? (
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded border-gray-300"
                          checked={specs[field.key] === 'true'}
                          onChange={e => setSpecs({...specs, [field.key]: e.target.checked ? 'true' : 'false'})}
                        />
                        <span className="text-sm font-bold">{fieldLabel} {field.required && '*'}</span>
                      </label>
                    ) : (
                      <>
                        <label className="block text-sm font-bold mb-2">
                          {fieldLabel} {field.required && '*'}
                        </label>
                        {field.type === 'select' ? (
                          <select
                            className="w-full h-10 px-3 rounded-md border border-input bg-transparent"
                            value={specs[field.key] || ""}
                            onChange={e => setSpecs({...specs, [field.key]: e.target.value})}
                          >
                            <option value="">{t.create.chooseOption}</option>
                            {field.options?.map((opt: string, oi: number) => {
                              const translated = field.optionsI18n?.[lang]?.[oi];
                              return <option key={opt} value={opt}>{translated || opt}</option>;
                            })}
                          </select>
                        ) : field.type === 'textarea' ? (
                          <textarea
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[80px]"
                            placeholder={fieldPlaceholder}
                            value={specs[field.key] || ""}
                            onChange={e => setSpecs({...specs, [field.key]: e.target.value})}
                          />
                        ) : (
                          <Input
                            placeholder={fieldPlaceholder}
                            type={field.type === 'number' ? 'number' : 'text'}
                            value={specs[field.key] || ""}
                            onChange={e => setSpecs({...specs, [field.key]: e.target.value})}
                          />
                        )}
                      </>
                    )}
                  </div>
                  );
                })}

                <div>
                  <label className="block text-sm font-bold mb-2">{t.create.extraNotes}</label>
                  <textarea
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[100px]"
                    placeholder={t.create.extraNotesPlaceholder}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={handlePrev}><ChevronLeft className="w-4 h-4 mr-2"/>{t.general.back}</Button>
                <Button onClick={handleNext} disabled={!title || !brand} className="bg-primary hover:bg-primary/90 text-white">{t.create.next} <ChevronRight className="w-4 h-4 ml-2"/></Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl font-bold mb-6">{t.create.step3Title}</h2>

              <div className="space-y-8">
                <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-accent" /> {t.create.offerTypesTitle}</h3>

                  <div className="flex flex-wrap gap-3 mb-6">
                    {(['new', 'refurbished', 'occasion'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => toggleOfferType(type)}
                        className={`px-4 py-2 rounded-xl font-semibold capitalize border-2 transition-all ${allowedOffers.includes(type) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-border/80'}`}
                      >
                        {offerTypeLabel(type)}
                      </button>
                    ))}
                  </div>

                  <div className="p-4 bg-muted/50 rounded-xl flex items-start gap-4">
                    <input
                      type="checkbox"
                      id="similar"
                      checked={allowSimilar}
                      onChange={e => setAllowSimilar(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <div>
                      <label htmlFor="similar" className="font-bold text-secondary block mb-1 cursor-pointer">{t.create.similarTitle}</label>
                      <p className="text-sm text-muted-foreground">{t.create.similarDesc}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
                  <h3 className="font-bold text-lg mb-4">{t.create.contactTitle}</h3>
                  {user ? (
                    <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 font-bold text-primary text-sm">
                        {user.contactName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-secondary">{user.contactName}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <Check className="w-5 h-5 text-primary ml-auto" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold mb-2">{t.create.yourName} *</label>
                        <Input value={consumerName} onChange={e => setConsumerName(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2">{t.auth.email} *</label>
                        <Input type="email" value={consumerEmail} onChange={e => setConsumerEmail(e.target.value)} />
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-4">{t.create.privacyNote}</p>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={handlePrev}><ChevronLeft className="w-4 h-4 mr-2"/>{t.general.back}</Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || !consumerName || !consumerEmail || allowedOffers.length === 0}
                  className="bg-primary hover:bg-primary/90 text-white h-12 px-8 text-lg font-bold"
                >
                  {createMutation.isPending ? t.create.submitting : t.create.submit}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
