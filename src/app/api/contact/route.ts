// src/app/api/contact/route.ts
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import Contact from "@/lib/models/Contact";
import { Site } from "@/lib/models/Site";
import User from "@/lib/models/User";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  await connectDb();

  try {
    const { name, email, phone, message, siteSlug } = await req.json();

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    // Find the site
    const site = await Site.findOne({ slug: siteSlug });
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Find the site owner
    const owner = await User.findById(site.ownerId);
    if (!owner) {
      return NextResponse.json(
        { error: "Site owner not found" },
        { status: 404 }
      );
    }

    // Get client IP and other metadata
    const forwarded = req.headers.get("x-forwarded-for");
    const ipAddress = forwarded ? forwarded.split(",")[0] : "unknown";

    // Save contact to database
    const contact = new Contact({
      name,
      email,
      phone,
      message,
      siteSlug,
      siteId: site._id,
      metadata: {
        ipAddress,
        userAgent: req.headers.get("user-agent") || undefined,
        referrer: req.headers.get("referer") || undefined,
        pageUrl: req.headers.get("referer") || undefined,
      },
    });

    await contact.save();

    // Send email notification to site owner
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // Email to site owner
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: owner.email,
        subject: `New Contact Form Submission - ${site.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Contact Form Submission</h2>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
              <p><strong>Message:</strong></p>
              <p style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #007bff;">${message.replace(
                /\n/g,
                "<br>"
              )}</p>
              <p><strong>Site:</strong> ${site.name} (${siteSlug})</p>
              <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p>You can manage this lead in your <a href="${
              process.env.NEXT_PUBLIC_BASE_URL
            }/dashboard/leads" style="color: #007bff;">CRM Dashboard</a></p>
          </div>
        `,
      });

      // Confirmation email to user
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: `Thank you for contacting ${site.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Thank You for Contacting Us!</h2>
            <p>Hi ${name},</p>
            <p>Thank you for reaching out to ${
              site.name
            }. We've received your message and will get back to you within 24 hours.</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Your Message:</strong></p>
              <p style="background: white; padding: 15px; border-radius: 4px;">${message.replace(
                /\n/g,
                "<br>"
              )}</p>
            </div>
            <p>If you have any urgent questions, feel free to call us at ${
              site.userWebsite?.data?.contact?.phone || "our phone number"
            }.</p>
            <p>Best regards,<br>The ${site.name} Team</p>
          </div>
        `,
      });

      // Mark email as sent
      contact.emailSent = true;
      contact.emailSentAt = new Date();
      await contact.save();
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't fail the request if email fails, just log it
    }

    return NextResponse.json({
      message: "Message sent successfully",
      contactId: contact._id,
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
