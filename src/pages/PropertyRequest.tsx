import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Bed, Bath, MapPin, Square, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useCreatePropertyRequest, useProperty } from "@/hooks/useProperties";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const requestSchema = z.object({
  applicant_name: z.string().trim().min(2, "Enter your full name").max(120),
  applicant_email: z.string().trim().email("Enter a valid email address").max(255),
  applicant_phone: z.string().trim().min(7, "Enter a valid phone number").max(30),
  contact_method: z.enum(["email", "phone"]),
  move_in_date: z.string().optional(),
  number_of_occupants: z.coerce.number().int().min(1).max(20).optional(),
  message: z.string().max(2000, "Message must be under 2,000 characters"),
});

type RequestForm = z.infer<typeof requestSchema>;

const getLocalDate = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

const PropertyRequest = () => {
  const { id = "" } = useParams();
  const [searchParams] = useSearchParams();
  const requestType = searchParams.get("type") === "rental" ? "rental" : "purchase";
  const { user, loading: authLoading } = useAuth();
  const { data: property, isLoading, isError, refetch } = useProperty(id);
  const createRequest = useCreatePropertyRequest();
  const [requestId, setRequestId] = useState<string | null>(null);

  const form = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      applicant_name: user?.user_metadata?.full_name || "",
      applicant_email: user?.email || "",
      applicant_phone: "",
      contact_method: "email",
      move_in_date: "",
      number_of_occupants: 1,
      message: "",
    },
  });
  const { reset } = form;

  useEffect(() => {
    if (user) {
      reset({
        applicant_name: user.user_metadata?.full_name || "",
        applicant_email: user.email || "",
        applicant_phone: "",
        contact_method: "email",
        move_in_date: "",
        number_of_occupants: 1,
        message: "",
      });
    }
  }, [user, reset]);

  const transactionType = property?.transaction_type || "sale";
  const availabilityStatus = property?.availability_status || "available";
  const isEligible = property
    && availabilityStatus === "available"
    && (requestType === "purchase"
      ? transactionType === "sale" || transactionType === "both"
      : (transactionType === "rent" || transactionType === "both") && property.rent_price != null);
  const price = requestType === "rental" ? property?.rent_price : property?.price;

  const onSubmit = async (values: RequestForm) => {
    if (!property || !isEligible) return;
    if (requestType === "rental") {
      const localToday = new Date();
      localToday.setHours(0, 0, 0, 0);
      if (!values.move_in_date || new Date(`${values.move_in_date}T00:00:00`) < localToday) {
        form.setError("move_in_date", { message: "Choose today or a future move-in date" });
        return;
      }
    }

    try {
      const createdId = await createRequest.mutateAsync({
        property_id: property.id,
        request_type: requestType,
        applicant_name: values.applicant_name,
        applicant_email: values.applicant_email,
        applicant_phone: values.applicant_phone,
        contact_method: values.contact_method,
        message: values.message,
        move_in_date: requestType === "rental" ? values.move_in_date || null : null,
        number_of_occupants: requestType === "rental" ? values.number_of_occupants || 1 : null,
      });
      setRequestId(createdId);
      try {
        const { error: notificationError } = await supabase.functions.invoke("send-ticket-notification", {
          body: { type: "property_request_created", requestId: createdId },
        });
        if (notificationError) {
          toast.warning("Your request was saved, but its email confirmation could not be sent.");
        }
      } catch {
        toast.warning("Your request was saved, but its email confirmation could not be sent.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "We couldn't submit your request. Please try again.";
      form.setError("root", { message: message.includes("duplicate key") ? "You already have an active request for this property." : message });
    }
  };

  if (!authLoading && !user) {
    const returnTo = `/property/${id}/request?type=${requestType}`;
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <section className="site-container py-36 text-center">
          <h1 className="text-3xl font-bold text-foreground">Sign in to continue</h1>
          <p className="mt-3 text-muted-foreground">Your account is required to submit and track a property request.</p>
          <Link to={`/auth?returnTo=${encodeURIComponent(returnTo)}`}>
            <Button variant="gold" className="mt-6">Sign In</Button>
          </Link>
        </section>
        <Footer />
      </main>
    );
  }

  if (isLoading || authLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="site-container animate-pulse py-36 text-muted-foreground">Loading request form...</div>
        <Footer />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <section className="site-container py-36 text-center">
          <h1 className="text-2xl font-bold text-foreground">Unable to load property</h1>
          <p className="mt-3 text-muted-foreground">Please check your connection and try again.</p>
          <Button variant="outline" className="mt-6" onClick={() => refetch()}>Try Again</Button>
        </section>
        <Footer />
      </main>
    );
  }

  if (!property) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <section className="site-container py-36 text-center">
          <h1 className="text-3xl font-bold">Property Not Found</h1>
          <Link to="/properties"><Button variant="outline" className="mt-6">Browse Properties</Button></Link>
        </section>
        <Footer />
      </main>
    );
  }

  const rentPeriodLabel = property.rent_period ? ` / ${property.rent_period}` : "";

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="site-container max-w-5xl py-28 sm:py-32">
        <Link to={`/property/${property.id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to property
        </Link>

        {requestId ? (
          <div className="mx-auto mt-10 max-w-2xl border border-border bg-card p-8 text-center shadow-card sm:p-12">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
            <h1 className="mt-5 text-3xl font-bold text-foreground">Request submitted</h1>
            <p className="mt-3 text-muted-foreground">
              Your {requestType === "purchase" ? "purchase request" : "rental application"} has been received. Our property team will contact you shortly.
            </p>
            <p className="mt-5 text-sm text-muted-foreground">Request ID</p>
            <p className="font-mono text-sm font-semibold text-foreground">{requestId}</p>
            <Link to="/my-requests"><Button variant="gold" className="mt-7">View My Requests</Button></Link>
          </div>
        ) : !isEligible ? (
          <div className="mx-auto mt-10 max-w-2xl border border-border bg-card p-8 text-center">
            <h1 className="text-2xl font-bold text-foreground">Property unavailable</h1>
            <p className="mt-3 text-muted-foreground">
              {availabilityStatus === "available"
                ? `This property is not listed for ${requestType === "purchase" ? "sale" : "rent"}.`
                : `This property is ${availabilityStatus === "pending" ? "pending" : availabilityStatus}.`}
            </p>
            <Link to={`/property/${property.id}`}><Button variant="outline" className="mt-6">View Property</Button></Link>
          </div>
        ) : (
          <>
            <div className="mb-8 mt-8">
              <span className="section-eyebrow">{requestType === "purchase" ? "Purchase request" : "Rental application"}</span>
              <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
                {requestType === "purchase" ? "Request to buy this property" : "Apply to rent this property"}
              </h1>
              <p className="mt-3 text-muted-foreground">Submitting a request does not charge you or complete a transaction.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <aside className="self-start border border-border bg-card">
                {property.image_url && <img src={property.image_url} alt={property.title} className="aspect-[16/10] w-full object-cover" />}
                <div className="p-5">
                  <h2 className="text-xl font-semibold text-foreground">{property.title}</h2>
                  <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{property.location}</p>
                  <p className="mt-4 text-2xl font-bold text-gold">
                    ${price?.toLocaleString()}{requestType === "rental" ? rentPeriodLabel : ""}
                  </p>
                  {requestType === "rental" && property.security_deposit !== null && (
                    <p className="mt-1 text-sm text-muted-foreground">Security deposit: ${property.security_deposit.toLocaleString()}</p>
                  )}
                  {requestType === "rental" && property.availability_date && (
                    <p className="mt-1 text-sm text-muted-foreground">Available from: {property.availability_date}</p>
                  )}
                  {requestType === "rental" && property.minimum_rental_period && (
                    <p className="mt-1 text-sm text-muted-foreground">Minimum rental period: {property.minimum_rental_period} months</p>
                  )}
                  <div className="mt-5 flex flex-wrap gap-4 border-t border-border pt-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Bed className="h-4 w-4" />{property.beds} beds</span>
                    <span className="flex items-center gap-1"><Bath className="h-4 w-4" />{property.baths} baths</span>
                    <span className="flex items-center gap-1"><Square className="h-4 w-4" />{property.sqft.toLocaleString()} sqft</span>
                  </div>
                </div>
              </aside>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 border border-border bg-card p-5 sm:p-7">
                <h2 className="text-xl font-semibold text-foreground">Your contact information</h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="applicant_name">Full name <span aria-hidden="true">*</span></Label>
                    <Input id="applicant_name" autoComplete="name" {...form.register("applicant_name")} />
                    {form.formState.errors.applicant_name && <p className="text-sm text-destructive">{form.formState.errors.applicant_name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="applicant_email">Email <span aria-hidden="true">*</span></Label>
                    <Input id="applicant_email" type="email" autoComplete="email" {...form.register("applicant_email")} />
                    {form.formState.errors.applicant_email && <p className="text-sm text-destructive">{form.formState.errors.applicant_email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="applicant_phone">Phone <span aria-hidden="true">*</span></Label>
                    <Input id="applicant_phone" type="tel" autoComplete="tel" {...form.register("applicant_phone")} />
                    {form.formState.errors.applicant_phone && <p className="text-sm text-destructive">{form.formState.errors.applicant_phone.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_method">Preferred contact</Label>
                    <Select value={form.watch("contact_method")} onValueChange={(value) => form.setValue("contact_method", value as "email" | "phone")}>
                      <SelectTrigger id="contact_method"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {requestType === "rental" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="move_in_date">Preferred move-in date <span aria-hidden="true">*</span></Label>
                        <Input id="move_in_date" type="date" min={getLocalDate()} {...form.register("move_in_date")} />
                        {form.formState.errors.move_in_date && <p className="text-sm text-destructive">{form.formState.errors.move_in_date.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="number_of_occupants">Number of occupants <span aria-hidden="true">*</span></Label>
                        <Input id="number_of_occupants" type="number" min="1" max="20" {...form.register("number_of_occupants")} />
                        {form.formState.errors.number_of_occupants && <p className="text-sm text-destructive">{form.formState.errors.number_of_occupants.message}</p>}
                      </div>
                    </>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message (optional)</Label>
                  <Textarea id="message" rows={4} maxLength={2000} placeholder="Share any details or questions about this property." {...form.register("message")} />
                  {form.formState.errors.message && <p className="text-sm text-destructive">{form.formState.errors.message.message}</p>}
                </div>
                {form.formState.errors.root && (
                  <p role="alert" className="border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    {form.formState.errors.root.message}
                  </p>
                )}
                <Button type="submit" variant="gold" size="lg" className="w-full" disabled={createRequest.isPending}>
                  {createRequest.isPending ? "Submitting your request..." : requestType === "purchase" ? "Submit Purchase Request" : "Submit Rental Application"}
                </Button>
                <p className="text-xs text-muted-foreground">Your contact details are shared only with the property team to respond to this request.</p>
              </form>
            </div>
          </>
        )}
      </section>
      <Footer />
    </main>
  );
};

export default PropertyRequest;
