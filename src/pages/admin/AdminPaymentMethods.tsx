import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Building2, Trash2, Plus, Star } from "lucide-react";
import { z } from "zod";

const paymentMethodSchema = z.object({
  method_type: z.enum(["credit_card", "bank_account", "paypal"]),
  card_holder_name: z.string().max(100).optional(),
  card_last_four: z.string().length(4).regex(/^\d{4}$/).optional(),
  card_brand: z.string().max(50).optional(),
  bank_name: z.string().max(100).optional(),
  bank_account_last_four: z.string().length(4).regex(/^\d{4}$/).optional(),
  paypal_email: z.string().email().max(255).optional(),
});

type PaymentMethod = {
  id: string;
  user_id: string;
  method_type: "credit_card" | "bank_account" | "paypal";
  card_holder_name: string | null;
  card_last_four: string | null;
  card_brand: string | null;
  bank_name: string | null;
  bank_account_last_four: string | null;
  paypal_email: string | null;
  is_default: boolean;
  created_at: string;
};

const AdminPaymentMethods = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [methodType, setMethodType] = useState<"credit_card" | "bank_account" | "paypal">("credit_card");
  const [formData, setFormData] = useState({
    card_holder_name: "",
    card_last_four: "",
    card_brand: "",
    bank_name: "",
    bank_account_last_four: "",
    paypal_email: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: paymentMethods, isLoading } = useQuery({
    queryKey: ["payment-methods", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PaymentMethod[];
    },
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: async (data: z.infer<typeof paymentMethodSchema>) => {
      const { error } = await supabase.from("payment_methods").insert([{
        user_id: user!.id,
        method_type: data.method_type,
        card_holder_name: data.card_holder_name || null,
        card_last_four: data.card_last_four || null,
        card_brand: data.card_brand || null,
        bank_name: data.bank_name || null,
        bank_account_last_four: data.bank_account_last_four || null,
        paypal_email: data.paypal_email || null,
      }] as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      toast({ title: "Payment method added successfully" });
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Error adding payment method", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("payment_methods").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      toast({ title: "Payment method removed" });
    },
    onError: (error) => {
      toast({ title: "Error removing payment method", description: error.message, variant: "destructive" });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      // First, unset all defaults
      await supabase.from("payment_methods").update({ is_default: false }).eq("user_id", user!.id);
      // Then set the new default
      const { error } = await supabase.from("payment_methods").update({ is_default: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      toast({ title: "Default payment method updated" });
    },
    onError: (error) => {
      toast({ title: "Error updating default", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setMethodType("credit_card");
    setFormData({
      card_holder_name: "",
      card_last_four: "",
      card_brand: "",
      bank_name: "",
      bank_account_last_four: "",
      paypal_email: "",
    });
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const data: z.infer<typeof paymentMethodSchema> = {
      method_type: methodType,
    };

    if (methodType === "credit_card") {
      if (!formData.card_holder_name.trim()) {
        setErrors({ card_holder_name: "Card holder name is required" });
        return;
      }
      if (!formData.card_last_four || !/^\d{4}$/.test(formData.card_last_four)) {
        setErrors({ card_last_four: "Enter last 4 digits" });
        return;
      }
      data.card_holder_name = formData.card_holder_name.trim();
      data.card_last_four = formData.card_last_four;
      data.card_brand = formData.card_brand || undefined;
    } else if (methodType === "bank_account") {
      if (!formData.bank_name.trim()) {
        setErrors({ bank_name: "Bank name is required" });
        return;
      }
      if (!formData.bank_account_last_four || !/^\d{4}$/.test(formData.bank_account_last_four)) {
        setErrors({ bank_account_last_four: "Enter last 4 digits" });
        return;
      }
      data.bank_name = formData.bank_name.trim();
      data.bank_account_last_four = formData.bank_account_last_four;
    } else if (methodType === "paypal") {
      if (!formData.paypal_email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.paypal_email)) {
        setErrors({ paypal_email: "Valid email is required" });
        return;
      }
      data.paypal_email = formData.paypal_email.trim();
    }

    addMutation.mutate(data);
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case "credit_card":
        return <CreditCard className="h-5 w-5" />;
      case "bank_account":
        return <Building2 className="h-5 w-5" />;
      case "paypal":
        return <span className="text-sm font-bold">PP</span>;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getMethodLabel = (method: PaymentMethod) => {
    switch (method.method_type) {
      case "credit_card":
        return `${method.card_brand || "Card"} •••• ${method.card_last_four}`;
      case "bank_account":
        return `${method.bank_name} •••• ${method.bank_account_last_four}`;
      case "paypal":
        return method.paypal_email;
      default:
        return "Unknown";
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Payment Methods</h1>
          <p className="text-muted-foreground mt-1">Manage your payment information</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="bg-gold hover:bg-gold-dark text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="mb-8 border-border">
          <CardHeader>
            <CardTitle>Add Payment Method</CardTitle>
            <CardDescription>Enter your payment details (only last 4 digits stored for security)</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Payment Type</Label>
                <Select value={methodType} onValueChange={(v) => setMethodType(v as typeof methodType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">Credit/Debit Card</SelectItem>
                    <SelectItem value="bank_account">Bank Account</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {methodType === "credit_card" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="card_holder_name">Card Holder Name</Label>
                    <Input
                      id="card_holder_name"
                      value={formData.card_holder_name}
                      onChange={(e) => setFormData({ ...formData, card_holder_name: e.target.value })}
                      maxLength={100}
                    />
                    {errors.card_holder_name && <p className="text-sm text-destructive">{errors.card_holder_name}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="card_last_four">Last 4 Digits</Label>
                      <Input
                        id="card_last_four"
                        value={formData.card_last_four}
                        onChange={(e) => setFormData({ ...formData, card_last_four: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                        maxLength={4}
                        placeholder="1234"
                      />
                      {errors.card_last_four && <p className="text-sm text-destructive">{errors.card_last_four}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card_brand">Card Brand (optional)</Label>
                      <Select value={formData.card_brand} onValueChange={(v) => setFormData({ ...formData, card_brand: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Visa">Visa</SelectItem>
                          <SelectItem value="Mastercard">Mastercard</SelectItem>
                          <SelectItem value="Amex">American Express</SelectItem>
                          <SelectItem value="Discover">Discover</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}

              {methodType === "bank_account" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="bank_name">Bank Name</Label>
                    <Input
                      id="bank_name"
                      value={formData.bank_name}
                      onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                      maxLength={100}
                    />
                    {errors.bank_name && <p className="text-sm text-destructive">{errors.bank_name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bank_account_last_four">Account Last 4 Digits</Label>
                    <Input
                      id="bank_account_last_four"
                      value={formData.bank_account_last_four}
                      onChange={(e) => setFormData({ ...formData, bank_account_last_four: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                      maxLength={4}
                      placeholder="1234"
                    />
                    {errors.bank_account_last_four && <p className="text-sm text-destructive">{errors.bank_account_last_four}</p>}
                  </div>
                </>
              )}

              {methodType === "paypal" && (
                <div className="space-y-2">
                  <Label htmlFor="paypal_email">PayPal Email</Label>
                  <Input
                    id="paypal_email"
                    type="email"
                    value={formData.paypal_email}
                    onChange={(e) => setFormData({ ...formData, paypal_email: e.target.value })}
                    maxLength={255}
                  />
                  {errors.paypal_email && <p className="text-sm text-destructive">{errors.paypal_email}</p>}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="bg-gold hover:bg-gold-dark text-white" disabled={addMutation.isPending}>
                  {addMutation.isPending ? "Adding..." : "Add Payment Method"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 w-48 bg-secondary rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : paymentMethods && paymentMethods.length > 0 ? (
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <Card key={method.id} className={`border-border ${method.is_default ? "ring-2 ring-gold" : ""}`}>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                    {getMethodIcon(method.method_type)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{getMethodLabel(method)}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {method.method_type.replace("_", " ")}
                      {method.is_default && " • Default"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!method.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDefaultMutation.mutate(method.id)}
                      disabled={setDefaultMutation.isPending}
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMutation.mutate(method.id)}
                    disabled={deleteMutation.isPending}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No payment methods added yet</p>
            <Button onClick={() => setShowForm(true)} variant="outline" className="mt-4">
              Add Your First Payment Method
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminPaymentMethods;
