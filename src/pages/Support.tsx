import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import { Send, Ticket, Clock, CheckCircle, AlertCircle, HelpCircle, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import TicketConversation from "@/components/TicketConversation";

const ticketSchema = z.object({
  guest_name: z.string().max(100, "Name must be less than 100 characters").optional(),
  guest_email: z.string().email("Invalid email address").max(255, "Email must be less than 255 characters").optional(),
  subject: z.string().min(1, "Subject is required").max(200, "Subject must be less than 200 characters"),
  message: z.string().min(1, "Message is required").max(2000, "Message must be less than 2000 characters"),
  priority: z.enum(["low", "normal", "high", "urgent"]),
});

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
  admin_notes: string | null;
  guest_name: string | null;
  guest_email: string | null;
}

const statusConfig: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  open: { icon: AlertCircle, color: "bg-yellow-500/10 text-yellow-600", label: "Open" },
  in_progress: { icon: Clock, color: "bg-blue-500/10 text-blue-600", label: "In Progress" },
  resolved: { icon: CheckCircle, color: "bg-green-500/10 text-green-600", label: "Resolved" },
  closed: { icon: CheckCircle, color: "bg-muted text-muted-foreground", label: "Closed" },
};

const Support = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [userTickets, setUserTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState<{
    guest_name: string;
    guest_email: string;
    subject: string;
    message: string;
    priority: "low" | "normal" | "high" | "urgent";
  }>({
    guest_name: "",
    guest_email: "",
    subject: "",
    message: "",
    priority: "normal",
  });

  useEffect(() => {
    if (user) {
      fetchUserTickets();
    }
  }, [user]);

  const fetchUserTickets = async () => {
    if (!user) return;
    setLoadingTickets(true);
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUserTickets(data || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoadingTickets(false);
    }
  };

  const sendNotification = async (ticketSubject: string, message: string, email: string, name: string) => {
    try {
      await supabase.functions.invoke("send-ticket-notification", {
        body: {
          type: "ticket_created",
          ticketId: "",
          recipientEmail: email,
          recipientName: name,
          ticketSubject,
          message,
        },
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = ticketSchema.safeParse({
      ...formData,
      guest_name: !user ? formData.guest_name : undefined,
      guest_email: !user ? formData.guest_email : undefined,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    if (!user && (!formData.guest_name.trim() || !formData.guest_email.trim())) {
      if (!formData.guest_name.trim()) setErrors(prev => ({ ...prev, guest_name: "Name is required" }));
      if (!formData.guest_email.trim()) setErrors(prev => ({ ...prev, guest_email: "Email is required" }));
      return;
    }

    setIsSubmitting(true);

    try {
      const ticketData = {
        user_id: user?.id || null,
        property_id: null,
        guest_name: !user ? formData.guest_name : null,
        guest_email: !user ? formData.guest_email : null,
        subject: formData.subject,
        message: formData.message,
        priority: formData.priority,
        status: "open",
      };

      const { error } = await supabase
        .from("support_tickets")
        .insert(ticketData);

      if (error) throw error;

      // Send email notification
      const recipientEmail = user?.email || formData.guest_email;
      const recipientName = formData.guest_name || "Customer";
      if (recipientEmail) {
        await sendNotification(formData.subject, formData.message, recipientEmail, recipientName);
      }

      toast({
        title: "Ticket Submitted",
        description: "We'll get back to you as soon as possible.",
      });

      setFormData({
        guest_name: "",
        guest_email: "",
        subject: "",
        message: "",
        priority: "normal",
      });

      if (user) {
        fetchUserTickets();
      }
    } catch (error) {
      console.error("Error submitting ticket:", error);
      toast({
        title: "Error",
        description: "Failed to submit ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-primary pb-20 pt-32 text-primary-foreground">
        <div className="site-container">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="section-eyebrow">
              Help Center
            </span>
            <h1 className="mt-2 text-4xl font-bold text-primary-foreground md:text-5xl">
              Support Center
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/70">
              Have questions about a property or need assistance? Submit a ticket and our team will respond promptly.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Submit Ticket Form */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-gold" />
                  Submit a Ticket
                </CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you shortly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!user && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="guest_name">Your Name *</Label>
                        <Input
                          id="guest_name"
                          value={formData.guest_name}
                          onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                          placeholder="John Doe"
                          maxLength={100}
                        />
                        {errors.guest_name && (
                          <p className="text-sm text-destructive">{errors.guest_name}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="guest_email">Your Email *</Label>
                        <Input
                          id="guest_email"
                          type="email"
                          value={formData.guest_email}
                          onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })}
                          placeholder="john@example.com"
                          maxLength={255}
                        />
                        {errors.guest_email && (
                          <p className="text-sm text-destructive">{errors.guest_email}</p>
                        )}
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="What's your question about?"
                      maxLength={200}
                    />
                    {errors.subject && (
                      <p className="text-sm text-destructive">{errors.subject}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: "low" | "normal" | "high" | "urgent") =>
                        setFormData({ ...formData, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Describe your question or concern..."
                      rows={5}
                      maxLength={2000}
                    />
                    {errors.message && (
                      <p className="text-sm text-destructive">{errors.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground text-right">
                      {formData.message.length}/2000
                    </p>
                  </div>

                  <Button type="submit" variant="gold" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Ticket
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* User's Tickets */}
            <div className="space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="font-heading flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-gold" />
                    Your Tickets
                  </CardTitle>
                  <CardDescription>
                    {user ? "View and track your submitted tickets." : "Sign in to view your ticket history."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!user ? (
                    <p className="text-muted-foreground text-center py-8">
                      Please sign in to view your ticket history.
                    </p>
                  ) : loadingTickets ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="h-24 bg-secondary/50 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : userTickets.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      You haven't submitted any tickets yet.
                    </p>
                  ) : (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto">
                      {userTickets.map((ticket) => {
                        const status = statusConfig[ticket.status] || statusConfig.open;
                        const StatusIcon = status.icon;
                        return (
                          <div
                            key={ticket.id}
                            className="border border-border rounded-lg p-4 space-y-2 cursor-pointer hover:bg-secondary/30 transition-colors"
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-foreground line-clamp-1">
                                {ticket.subject}
                              </h4>
                              <Badge className={status.color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {status.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {ticket.message}
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{format(new Date(ticket.created_at), "MMM d, yyyy")}</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {ticket.priority}
                                </Badge>
                                <Button variant="ghost" size="sm" className="h-6 px-2">
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Conversation Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-gold" />
              {selectedTicket?.subject}
            </DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="h-[500px]">
              <TicketConversation
                ticketId={selectedTicket.id}
                ticketSubject={selectedTicket.subject}
                ticketStatus={selectedTicket.status}
                initialMessage={selectedTicket.message}
                createdAt={selectedTicket.created_at}
                guestName={selectedTicket.guest_name}
                guestEmail={selectedTicket.guest_email}
                isAdmin={false}
                onReplyAdded={fetchUserTickets}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  );
};

export default Support;
