import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Send, User, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
interface TicketReply {
  id: string;
  ticket_id: string;
  user_id: string | null;
  message: string;
  is_admin_reply: boolean;
  created_at: string;
}
interface TicketConversationProps {
  ticketId: string;
  ticketSubject: string;
  ticketStatus: string;
  initialMessage: string;
  createdAt: string;
  guestName?: string | null;
  guestEmail?: string | null;
  isAdmin?: boolean;
  onReplyAdded?: () => void;
}
const TicketConversation = ({
  ticketId,
  ticketSubject,
  ticketStatus,
  initialMessage,
  createdAt,
  guestName,
  guestEmail,
  isAdmin = false,
  onReplyAdded
}: TicketConversationProps) => {
  const [replies, setReplies] = useState<TicketReply[]>([]);
  const [newReply, setNewReply] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  useEffect(() => {
    fetchReplies();

    // Subscribe to realtime updates
    const channel = supabase.channel(`ticket-replies-${ticketId}`).on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'ticket_replies',
      filter: `ticket_id=eq.${ticketId}`
    }, payload => {
      setReplies(prev => [...prev, payload.new as TicketReply]);
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId]);
  const fetchReplies = async () => {
    setIsLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.from("ticket_replies").select("*").eq("ticket_id", ticketId).order("created_at", {
        ascending: true
      });
      if (error) throw error;
      setReplies(data || []);
    } catch (error) {
      console.error("Error fetching replies:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const sendNotification = async (replyMessage: string) => {
    try {
      // Get ticket owner info for notification
      const {
        data: ticket
      } = await supabase.from("support_tickets").select("user_id, guest_email, guest_name").eq("id", ticketId).single();
      if (!ticket) return;
      let recipientEmail = ticket.guest_email;
      let recipientName = ticket.guest_name || "Customer";

      // If ticket belongs to a registered user, get their email from profiles
      if (ticket.user_id && isAdmin) {
        const {
          data: profile
        } = await supabase.from("profiles").select("email, full_name").eq("id", ticket.user_id).single();
        if (profile) {
          recipientEmail = profile.email;
          recipientName = profile.full_name || "Customer";
        }
      }
      if (recipientEmail) {
        await supabase.functions.invoke("send-ticket-notification", {
          body: {
            type: "reply_added",
            ticketId,
            recipientEmail,
            recipientName,
            ticketSubject,
            replyMessage,
            isAdminReply: isAdmin
          }
        });
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim() || !user) return;
    setIsSubmitting(true);
    try {
      const {
        error
      } = await supabase.from("ticket_replies").insert({
        ticket_id: ticketId,
        user_id: user.id,
        message: newReply.trim(),
        is_admin_reply: isAdmin
      });
      if (error) throw error;

      // Send email notification
      await sendNotification(newReply.trim());
      setNewReply("");
      onReplyAdded?.();
      toast({
        title: "Reply sent",
        description: "Your reply has been added to the ticket."
      });
    } catch (error) {
      console.error("Error adding reply:", error);
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const isClosed = ticketStatus === "closed";
  return <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4">
          {/* Original message */}
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">
                  {guestName || "Customer"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(createdAt), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-sm">
                {initialMessage}
              </div>
            </div>
          </div>

          {/* Replies */}
          {isLoading ? <div className="flex justify-center py-4">
              <div className="animate-pulse text-muted-foreground">Loading conversation...</div>
            </div> : replies.map(reply => <div key={reply.id} className={cn("flex gap-3", reply.is_admin_reply && "flex-row-reverse")}>
                <div className={cn("flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center", reply.is_admin_reply ? "bg-gold/20" : "bg-secondary")}>
                  {reply.is_admin_reply ? <Shield className="h-4 w-4 text-gold" /> : <User className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className={cn("flex-1", reply.is_admin_reply && "text-right")}>
                  <div className={cn("flex items-center gap-2 mb-1", reply.is_admin_reply && "justify-end")}>
                    <span className="font-medium text-sm">
                      {reply.is_admin_reply ? "Support Team" : guestName || "Customer"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(reply.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                  <div className={cn("rounded-lg p-3 text-sm inline-block max-w-[85%]", reply.is_admin_reply ? "bg-gold/10 text-foreground" : "bg-secondary/50")}>
                    {reply.message}
                  </div>
                </div>
              </div>)}
        </div>
      </ScrollArea>

      {/* Reply form */}
      {user && !isClosed ? <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t my-0 mb-[120px]">
          <div className="space-y-2">
            <Textarea value={newReply} onChange={e => setNewReply(e.target.value)} placeholder="Type your reply..." rows={3} maxLength={2000} />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {newReply.length}/2000
              </span>
              <Button type="submit" variant="gold" size="sm" disabled={isSubmitting || !newReply.trim()}>
                {isSubmitting ? "Sending..." : <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Reply
                  </>}
              </Button>
            </div>
          </div>
        </form> : isClosed ? <div className="mt-4 pt-4 border-t text-center text-muted-foreground text-sm">
          This ticket is closed. No further replies can be added.
        </div> : <div className="mt-4 pt-4 border-t text-center text-muted-foreground text-sm">
          Please sign in to reply to this ticket.
        </div>}
    </div>;
};
export default TicketConversation;