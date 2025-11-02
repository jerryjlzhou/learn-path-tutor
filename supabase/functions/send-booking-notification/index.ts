import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingNotification {
  studentEmail: string;
  studentName: string;
  adminEmail: string;
  bookingDetails: {
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    mode: string;
    location?: string;
    price: number;
    paymentStatus: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { studentEmail, studentName, adminEmail, bookingDetails }: BookingNotification = await req.json();

    console.log("Sending booking notifications...", { studentEmail, adminEmail });

    // Send email to student
    const studentEmailResponse = await resend.emails.send({
      from: "Tutoring Platform <onboarding@resend.dev>",
      to: [studentEmail],
      subject: "Booking Confirmation",
      html: `
        <h1>Booking Confirmed!</h1>
        <p>Hi ${studentName},</p>
        <p>Your tutoring session has been booked successfully.</p>
        
        <h2>Booking Details:</h2>
        <ul>
          <li><strong>Date:</strong> ${bookingDetails.date}</li>
          <li><strong>Time:</strong> ${bookingDetails.startTime} - ${bookingDetails.endTime}</li>
          <li><strong>Duration:</strong> ${bookingDetails.duration} minutes</li>
          <li><strong>Mode:</strong> ${bookingDetails.mode}</li>
          ${bookingDetails.location ? `<li><strong>Location:</strong> ${bookingDetails.location}</li>` : ''}
          <li><strong>Price:</strong> $${(bookingDetails.price / 100).toFixed(2)} AUD</li>
          <li><strong>Payment Status:</strong> ${bookingDetails.paymentStatus}</li>
        </ul>
        
        ${bookingDetails.paymentStatus === 'unpaid' 
          ? '<p><em>Please note: Payment is pending. You can pay via cash, bank transfer, or contact us for payment options.</em></p>'
          : '<p><em>Payment completed. Thank you!</em></p>'
        }
        
        <p>If you need to make any changes, please contact us.</p>
        <p>Best regards,<br>Your Tutor</p>
      `,
    });

    console.log("Student email sent:", studentEmailResponse);

    // Send email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "Tutoring Platform <onboarding@resend.dev>",
      to: [adminEmail],
      subject: "New Booking Received",
      html: `
        <h1>New Booking Alert!</h1>
        <p>A new tutoring session has been booked.</p>
        
        <h2>Student Information:</h2>
        <ul>
          <li><strong>Name:</strong> ${studentName}</li>
          <li><strong>Email:</strong> ${studentEmail}</li>
        </ul>
        
        <h2>Booking Details:</h2>
        <ul>
          <li><strong>Date:</strong> ${bookingDetails.date}</li>
          <li><strong>Time:</strong> ${bookingDetails.startTime} - ${bookingDetails.endTime}</li>
          <li><strong>Duration:</strong> ${bookingDetails.duration} minutes</li>
          <li><strong>Mode:</strong> ${bookingDetails.mode}</li>
          ${bookingDetails.location ? `<li><strong>Location:</strong> ${bookingDetails.location}</li>` : ''}
          <li><strong>Price:</strong> $${(bookingDetails.price / 100).toFixed(2)} AUD</li>
          <li><strong>Payment Status:</strong> ${bookingDetails.paymentStatus}</li>
        </ul>
        
        <p>Please check your dashboard for more details.</p>
      `,
    });

    console.log("Admin email sent:", adminEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        studentEmailId: studentEmailResponse.data?.id,
        adminEmailId: adminEmailResponse.data?.id 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error in send-booking-notification function:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
