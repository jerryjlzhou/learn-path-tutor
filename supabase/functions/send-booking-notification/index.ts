import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const BOOKINGS_EMAIL = Deno.env.get("BOOKINGS_EMAIL") || "bookings@jeniuseducation.com";

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

    const isOnline = bookingDetails.mode.toLowerCase() === 'online';
    
    // Common booking details HTML
    const bookingDetailsHtml = `
      <h2>Booking Details:</h2>
      <ul>
        <li><strong>Date:</strong> ${bookingDetails.date}</li>
        <li><strong>Time:</strong> ${bookingDetails.startTime} - ${bookingDetails.endTime}</li>
        <li><strong>Duration:</strong> ${bookingDetails.duration} minutes</li>
        <li><strong>Mode:</strong> ${bookingDetails.mode}</li>
        ${bookingDetails.location ? `<li><strong>Location:</strong> ${bookingDetails.location}</li>` : ''}
      </ul>
      
      ${isOnline ? `
        <div style="background-color: #f0f9ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin-top: 0;">📹 Online Session Link</h3>
          <p style="margin: 8px 0;"><strong>Zoom Meeting:</strong></p>
          <p style="background-color: white; padding: 12px; border-radius: 4px; font-family: monospace; color: #dc2626;">
            [Zoom link will be sent 24 hours before the session]
          </p>
          <p style="font-size: 14px; color: #64748b; margin-bottom: 0;">
            You'll receive the meeting link in a separate email closer to your session time.
          </p>
        </div>
      ` : ''}
      
      ${bookingDetails.paymentStatus === 'unpaid' 
        ? '<p style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 16px 0;"><strong>Payment Pending:</strong> You can pay via cash, bank transfer, or contact us for payment options.</p>'
        : '<p style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 12px; margin: 16px 0;"><strong>Payment Confirmed:</strong> Thank you for your payment!</p>'
      }
    `;

    // Send email to student
    const studentEmailResponse = await resend.emails.send({
      from: `Jenius Education <${BOOKINGS_EMAIL}>`,
      to: [studentEmail],
      subject: `Booking Confirmation - ${bookingDetails.date}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e293b;">Booking Confirmed! ✅</h1>
          <p>Hi ${studentName},</p>
          <p>Your ${bookingDetails.mode} tutoring session has been successfully booked!</p>
          
          ${bookingDetailsHtml}
          
          <p>If you need to make any changes or have any questions, please don't hesitate to contact us.</p>
          
          <p style="margin-top: 32px;">Best regards,<br><strong>Jerry Zhou</strong><br>Jenius Education</p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
          <p style="font-size: 12px; color: #64748b;">
            This is an automated confirmation email. Please do not reply directly to this email.
          </p>
        </div>
      `,
    });

    console.log("Student email sent:", studentEmailResponse);

    // Send email to admin/tutor
    const adminEmailResponse = await resend.emails.send({
      from: `Jenius Education <${BOOKINGS_EMAIL}>`,
      to: [adminEmail],
      subject: `New Booking - ${studentName} - ${bookingDetails.date}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e293b;">New Booking Received! 🎓</h1>
          <p>A new tutoring session has been booked.</p>
          
          <h2>Student Information:</h2>
          <ul>
            <li><strong>Name:</strong> ${studentName}</li>
            <li><strong>Email:</strong> ${studentEmail}</li>
          </ul>
          
          ${bookingDetailsHtml}
          
          <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Price:</strong> $${(bookingDetails.price / 100).toFixed(2)} AUD</p>
            <p style="margin: 8px 0 0 0;"><strong>Payment Status:</strong> ${bookingDetails.paymentStatus === 'unpaid' ? '⏳ Pending' : '✅ Paid'}</p>
          </div>
          
          <p>Check your dashboard for complete booking details.</p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
          <p style="font-size: 12px; color: #64748b;">
            This is an automated notification email.
          </p>
        </div>
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
