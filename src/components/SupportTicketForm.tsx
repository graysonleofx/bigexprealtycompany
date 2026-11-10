import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import { MessageSquare, Send } from "lucide-react";

const ticketSchema = z.object({
  guest_name: z.string().max(100, "Name must be less than 100 characters").optional(),
  guest_email: z.string().email("Invalid email address").max(255, "Email must be less than 255 characters").optional(),
  subject: z.string().min(1, "Subject is required").max(200, "Subject must be less than 200 characters"),
  message: z.string().min(1, "Message is required").max(2000, "Message must be less than 2000 characters"),
  priority: z.enum(["low", "normal", "high", "urgent"]),
});

interface SupportTicketFormProps {
  propertyId?: string;
  propertyTitle?: string;
  triggerButton?: React.ReactNode;
}

const SupportTicketForm = ({ propertyId, propertyTitle, triggerButton }: SupportTicketFormProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
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
    subject: propertyTitle ? `Inquiry about: ${propertyTitle}` : "",
    message: "",
    priority: "normal",
  });

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
        property_id: propertyId || null,
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
        try {
          await supabase.functions.invoke("send-ticket-notification", {
            body: {
              type: "ticket_created",
              ticketId: "",
              recipientEmail,
              recipientName,
              ticketSubject: formData.subject,
              message: formData.message,
            },
          });
        } catch (e) {
          console.error("Error sending notification:", e);
        }
      }

      toast({
        title: "Ticket Submitted",
        description: "We'll get back to you as soon as possible.",
      });

      setFormData({
        guest_name: "",
        guest_email: "",
        subject: propertyTitle ? `Inquiry about: ${propertyTitle}` : "",
        message: "",
        priority: "normal",
      });
      setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" size="lg">
            <MessageSquare className="mr-2 h-5 w-5" />
            Ask a Question
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Submit Support Ticket</DialogTitle>
          <DialogDescription>
            Have a question? Fill out the form below and we'll respond shortly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
              rows={4}
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
      </DialogContent>
    </Dialog>
  );
};

export default SupportTicketForm;
