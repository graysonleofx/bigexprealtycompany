import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "ticket_created" | "ticket_updated" | "reply_added";
  ticketId: string;
  recipientEmail: string;
  recipientName: string;
  ticketSubject: string;
  message?: string;
  updatedFields?: string[];
  replyMessage?: string;
  isAdminReply?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: NotificationRequest = await req.json();
    console.log("Received notification request:", payload);

    const { type, ticketId, recipientEmail, recipientName, ticketSubject, message, updatedFields, replyMessage, isAdminReply } = payload;

    let subject = "";
    let htmlContent = "";

    switch (type) {
      case "ticket_created":
        subject = `Support Ticket Created: ${ticketSubject}`;
        htmlContent = `
          <h1>Support Ticket Created</h1>
          <p>Hello ${recipientName},</p>
          <p>Your support ticket has been successfully created.</p>
          <p><strong>Subject:</strong> ${ticketSubject}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          <p>We will get back to you as soon as possible.</p>
          <p>Best regards,<br>Luxe Realty Support Team</p>
        `;
        break;

      case "ticket_updated":
        subject = `Support Ticket Updated: ${ticketSubject}`;
        htmlContent = `
          <h1>Support Ticket Updated</h1>
          <p>Hello ${recipientName},</p>
          <p>Your support ticket has been updated.</p>
          <p><strong>Subject:</strong> ${ticketSubject}</p>
          <p><strong>Updated fields:</strong> ${updatedFields?.join(", ") || "Status"}</p>
          <p>Log in to view the latest updates on your ticket.</p>
          <p>Best regards,<br>Luxe Realty Support Team</p>
        `;
        break;

      case "reply_added":
        subject = `New Reply on Ticket: ${ticketSubject}`;
        htmlContent = `
          <h1>New Reply on Your Ticket</h1>
          <p>Hello ${recipientName},</p>
          <p>${isAdminReply ? "An admin has replied to your support ticket." : "A new reply has been added to your ticket."}</p>
          <p><strong>Subject:</strong> ${ticketSubject}</p>
          <p><strong>Reply:</strong></p>
          <p>${replyMessage}</p>
          <p>Log in to view the full conversation.</p>
          <p>Best regards,<br>Luxe Realty Support Team</p>
        `;
        break;
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Luxe Realty <onboarding@resend.dev>",
        to: [recipientEmail],
        subject,
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Resend API error: ${errorData}`);
    }

    const emailResponse = await res.json();
    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-ticket-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
