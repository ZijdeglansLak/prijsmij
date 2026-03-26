import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { useListCategories, useGetCategoryById, useCreateRequest } from "@workspace/api-client-react";
import type { CreateRequestBodyAllowedOfferTypesItem, TemplateFieldType } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check, Sparkles } from "lucide-react";

export default function CreateRequest() {
  const [step, setStep] = useState(1);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: categories } = useListCategories();
  const { data: categoryDetail } = useGetCategoryById(categoryId!, { query: { enabled: !!categoryId }});
  const createMutation = useCreateRequest();

  // Form State
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [specs, setSpecs] = useState<Record<string, string>>({});
  const [allowedOffers, setAllowedOffers] = useState<CreateRequestBodyAllowedOfferTypesItem[]>(['new']);
  const [allowSimilar, setAllowSimilar] = useState(false);
  const [consumerName, setConsumerName] = useState("");
  const [consumerEmail, setConsumerEmail] = useState("");

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
      toast({ title: "Gelukt!", description: "Je uitvraag staat live!" });
      setLocation(`/requests/${result.id}`);
    } catch (e) {
      toast({ title: "Fout", description: "Vul alle verplichte velden in.", variant: "destructive" });
    }
  };

  const toggleOfferType = (type: CreateRequestBodyAllowedOfferTypesItem) => {
    setAllowedOffers(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <Layout>
      <div className="bg-secondary text-white py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-extrabold mb-4">Plaats een nieuwe uitvraag</h1>
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
              <h2 className="text-2xl font-bold mb-6 text-center">Wat zoek je precies?</h2>
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
              <h2 className="text-2xl font-bold mb-6">Specificaties voor {categoryDetail.name}</h2>
              <div className="space-y-6 bg-card p-8 rounded-2xl border border-border shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold mb-2">Titel van je uitvraag *</label>
                    <Input placeholder="Bv: Samsung 65 inch OLED" value={title} onChange={e => setTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Voorkeursmerk *</label>
                    <Input placeholder="Bv: Samsung, LG, of Allemaal" value={brand} onChange={e => setBrand(e.target.value)} />
                  </div>
                </div>

                {categoryDetail.fields.map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-bold mb-2">
                      {field.label} {field.required && '*'}
                    </label>
                    {field.type === 'select' ? (
                      <select 
                        className="w-full h-10 px-3 rounded-md border border-input bg-transparent"
                        value={specs[field.key] || ""}
                        onChange={e => setSpecs({...specs, [field.key]: e.target.value})}
                      >
                        <option value="">Kies een optie...</option>
                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <Input 
                        placeholder={field.placeholder} 
                        type={field.type === 'number' ? 'number' : 'text'}
                        value={specs[field.key] || ""}
                        onChange={e => setSpecs({...specs, [field.key]: e.target.value})}
                      />
                    )}
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-bold mb-2">Extra opmerkingen</label>
                  <textarea 
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[100px]"
                    placeholder="Wat is nog meer belangrijk voor jou?"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={handlePrev}><ChevronLeft className="w-4 h-4 mr-2"/> Terug</Button>
                <Button onClick={handleNext} disabled={!title || !brand} className="bg-primary hover:bg-primary/90 text-white">Volgende <ChevronRight className="w-4 h-4 ml-2"/></Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl font-bold mb-6">Voorkeuren & Afronden</h2>
              
              <div className="space-y-8">
                <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-accent" /> Wat mogen winkels aanbieden?</h3>
                  
                  <div className="flex flex-wrap gap-3 mb-6">
                    {(['new', 'refurbished', 'occasion'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => toggleOfferType(type)}
                        className={`px-4 py-2 rounded-xl font-semibold capitalize border-2 transition-all ${allowedOffers.includes(type) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-border/80'}`}
                      >
                        {type === 'new' ? 'Nieuw' : type}
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
                      <label htmlFor="similar" className="font-bold text-secondary block mb-1 cursor-pointer">Winkels mogen een vergelijkbaar alternatief bieden</label>
                      <p className="text-sm text-muted-foreground">Soms heeft een winkel niet exact jouw model, maar wel een beter nieuwer model voor een goede prijs. Vink dit aan om verrast te worden.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
                  <h3 className="font-bold text-lg mb-4">Jouw contactgegevens</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold mb-2">Je naam *</label>
                      <Input value={consumerName} onChange={e => setConsumerName(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">E-mailadres *</label>
                      <Input type="email" value={consumerEmail} onChange={e => setConsumerEmail(e.target.value)} />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">Jouw gegevens zijn veilig. Alleen de winkelier die jij kiest krijgt jouw e-mailadres te zien.</p>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={handlePrev}><ChevronLeft className="w-4 h-4 mr-2"/> Terug</Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={createMutation.isPending || !consumerName || !consumerEmail || allowedOffers.length === 0} 
                  className="bg-primary hover:bg-primary/90 text-white h-12 px-8 text-lg font-bold"
                >
                  {createMutation.isPending ? "Bezig..." : "Plaats Uitvraag!"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
