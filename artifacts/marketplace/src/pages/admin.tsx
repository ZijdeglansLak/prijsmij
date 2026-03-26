import { useState } from "react";
import { Layout } from "@/components/layout";
import { useListCategories, useCreateCategory } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Settings, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-20 p-8 bg-card rounded-2xl shadow-lg border border-border">
          <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
          <Input 
            type="password" 
            placeholder="Wachtwoord (admin123)" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="mb-4"
          />
          <Button className="w-full" onClick={() => { if(password === "admin123") setIsAuthenticated(true); }}>
            Inloggen
          </Button>
        </div>
      </Layout>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const { data: categories, refetch } = useListCategories();
  const createMutation = useCreateCategory();
  const { toast } = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<any[]>([]);

  const handleAddField = () => {
    setFields([...fields, { key: `field_${Date.now()}`, label: "Nieuw Veld", type: "text", required: false }]);
  };

  const updateField = (index: number, key: string, value: any) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [key]: value };
    setFields(newFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      await createMutation.mutateAsync({
        data: { name, slug, icon, description, fields }
      });
      toast({ title: "Categorie toegevoegd!" });
      setIsAdding(false);
      refetch();
    } catch (e) {
      toast({ title: "Fout bij opslaan", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" /> Categorieën Beheer
          </h1>
          <Button onClick={() => setIsAdding(!isAdding)} className="bg-secondary text-white">
            <Plus className="w-4 h-4 mr-2" /> Nieuwe Categorie
          </Button>
        </div>

        {isAdding && (
          <div className="bg-card p-6 rounded-2xl border border-primary/30 shadow-lg mb-8">
            <h3 className="text-xl font-bold mb-4">Nieuwe categorie toevoegen</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div><label className="text-sm font-bold">Naam</label><Input value={name} onChange={e => setName(e.target.value)} /></div>
              <div><label className="text-sm font-bold">Slug</label><Input value={slug} onChange={e => setSlug(e.target.value)} /></div>
              <div><label className="text-sm font-bold">Icoon (emoji)</label><Input value={icon} onChange={e => setIcon(e.target.value)} /></div>
              <div><label className="text-sm font-bold">Beschrijving</label><Input value={description} onChange={e => setDescription(e.target.value)} /></div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold">Template Velden</h4>
                <Button variant="outline" size="sm" onClick={handleAddField}><Plus className="w-3 h-3 mr-1"/> Veld toevoegen</Button>
              </div>
              
              <div className="space-y-3">
                {fields.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 bg-muted p-3 rounded-lg">
                    <Input placeholder="Veld Label" value={f.label} onChange={e => updateField(i, 'label', e.target.value)} className="w-1/3 bg-white" />
                    <Input placeholder="Tech Key (bv screen_size)" value={f.key} onChange={e => updateField(i, 'key', e.target.value)} className="w-1/4 bg-white" />
                    <select className="border border-input rounded-md px-2 h-10 bg-white" value={f.type} onChange={e => updateField(i, 'type', e.target.value)}>
                      <option value="text">Text</option>
                      <option value="number">Nummer</option>
                    </select>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.required} onChange={e => updateField(i, 'required', e.target.checked)} /> Verplicht</label>
                    <button onClick={() => removeField(i)} className="p-2 text-destructive hover:bg-destructive/10 rounded-md ml-auto"><Trash2 className="w-4 h-4"/></button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 border-t border-border pt-4">
              <Button variant="outline" onClick={() => setIsAdding(false)}>Annuleren</Button>
              <Button onClick={handleSave} disabled={createMutation.isPending} className="bg-primary text-white">Opslaan</Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories?.map(cat => (
            <div key={cat.id} className="bg-card p-6 rounded-2xl border border-border shadow-sm">
              <div className="text-4xl mb-4">{cat.icon}</div>
              <h3 className="text-xl font-bold text-secondary mb-2">{cat.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{cat.description}</p>
              <div className="text-xs font-semibold bg-primary/10 text-primary inline-block px-3 py-1 rounded-full">
                {cat.activeRequestCount} actieve uitvragen
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
