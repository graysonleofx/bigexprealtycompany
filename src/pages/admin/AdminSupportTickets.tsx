import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Eye, Trash2, Search, Clock, CheckCircle, AlertCircle, MessageSquare } from "lucide-react";
import TicketConversation from "@/components/TicketConversation";

interface SupportTicket {
  id: string;
  user_id: string | null;
  property_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  subject: string;
  message: string;
  status: string;
  priority: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<string, { color: string; label: string }> = {
  open: { color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", label: "Open" },
  in_progress: { color: "bg-blue-500/10 text-blue-600 border-blue-500/20", label: "In Progress" },
  resolved: { color: "bg-green-500/10 text-green-600 border-green-500/20", label: "Resolved" },
  closed: { color: "bg-muted text-muted-foreground border-border", label: "Closed" },
};

const priorityConfig: Record<string, { color: string }> = {
  low: { color: "bg-slate-500/10 text-slate-600" },
  normal: { color: "bg-blue-500/10 text-blue-600" },
  high: { color: "bg-orange-500/10 text-orange-600" },
  urgent: { color: "bg-red-500/10 text-red-600" },
};

const AdminSupportTickets = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["admin-support-tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SupportTicket[];
    },
  });

  const sendStatusNotification = async (ticket: SupportTicket, newStatus: string) => {
    try {
      let recipientEmail = ticket.guest_email;
      let recipientName = ticket.guest_name || "Customer";

      if (ticket.user_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", ticket.user_id)
          .single();

        if (profile) {
          recipientEmail = profile.email;
          recipientName = profile.full_name || "Customer";
        }
      }

      if (recipientEmail) {
        await supabase.functions.invoke("send-ticket-notification", {
          body: {
            type: "ticket_updated",
            ticketId: ticket.id,
            recipientEmail,
            recipientName,
            ticketSubject: ticket.subject,
            updatedFields: ["Status changed to " + newStatus],
          },
        });
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("support_tickets")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      return { id, status };
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
      toast({ title: "Success", description: "Ticket status updated." });
      
      // Send notification
      if (selectedTicket) {
        await sendStatusNotification(selectedTicket, data.status);
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update ticket.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("support_tickets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
      toast({ title: "Success", description: "Ticket deleted successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete ticket.", variant: "destructive" });
    },
  });

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.guest_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.guest_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
  };

  const openTicketDialog = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setNewStatus(ticket.status);
  };

  const handleUpdateStatus = () => {
    if (!selectedTicket || newStatus === selectedTicket.status) return;
    updateMutation.mutate({
      id: selectedTicket.id,
      status: newStatus,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Support Tickets</h1>
        <p className="text-muted-foreground">Manage customer support inquiries</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" /> Open
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 flex items-center gap-1">
              <Clock className="h-4 w-4" /> In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" /> Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading tickets...
                </TableCell>
              </TableRow>
            ) : filteredTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No tickets found
                </TableCell>
              </TableRow>
            ) : (
              filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <div className="max-w-[200px]">
                      <p className="font-medium truncate">{ticket.subject}</p>
                      <p className="text-sm text-muted-foreground truncate">{ticket.message}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{ticket.guest_name || "Registered User"}</p>
                      <p className="text-muted-foreground">{ticket.guest_email || "-"}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusConfig[ticket.status]?.color}>
                      {statusConfig[ticket.status]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={priorityConfig[ticket.priority]?.color}>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(ticket.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openTicketDialog(ticket)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this ticket?")) {
                            deleteMutation.mutate(ticket.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Ticket Detail Dialog with Conversation */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {selectedTicket?.subject}
            </DialogTitle>
            <DialogDescription>
              View ticket details and respond to the customer
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <Tabs defaultValue="conversation" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="conversation">Conversation</TabsTrigger>
                <TabsTrigger value="details">Details & Status</TabsTrigger>
              </TabsList>

              <TabsContent value="conversation" className="h-[500px]">
                <TicketConversation
                  ticketId={selectedTicket.id}
                  ticketSubject={selectedTicket.subject}
                  ticketStatus={selectedTicket.status}
                  initialMessage={selectedTicket.message}
                  createdAt={selectedTicket.created_at}
                  guestName={selectedTicket.guest_name}
                  guestEmail={selectedTicket.guest_email}
                  isAdmin={true}
                  onReplyAdded={() => queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] })}
                />
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <p className="font-medium">{selectedTicket.guest_name || "Registered User"}</p>
                    <p className="text-sm">{selectedTicket.guest_email || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted</p>
                    <p>{format(new Date(selectedTicket.created_at), "PPpp")}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Priority</p>
                  <Badge variant="outline" className={`mt-1 ${priorityConfig[selectedTicket.priority]?.color}`}>
                    {selectedTicket.priority}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="gold" 
                    onClick={handleUpdateStatus} 
                    disabled={updateMutation.isPending || newStatus === selectedTicket.status}
                  >
                    {updateMutation.isPending ? "Saving..." : "Update Status"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSupportTickets;
