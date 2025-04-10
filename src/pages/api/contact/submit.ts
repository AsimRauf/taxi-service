import { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '@/lib/mongodb'
import Contact from '@/models/Contact'
import type { IContact } from '@/models/Contact'
import nodemailer from 'nodemailer'

// Create email transporter with support email credentials
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SUPPORT_EMAIL, // Using support email
    pass: process.env.SMTP_PASSWORD  // Using same password
  }
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await connectToDatabase()

    const { fullName, email, phoneNumber, subject, message } = req.body

    // Save to database with proper typing
    const contact: Partial<IContact> = {
      fullName,
      email,
      phoneNumber,
      subject,
      message,
      createdAt: new Date(),
      status: 'new'
    }

    const newContact = new Contact(contact)
    await newContact.save()

    // Send notification email to your personal email
    const supportMailOptions = {
      from: process.env.SUPPORT_EMAIL,
      to: 'asimraufbuzz@gmail.com', // Your personal email
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">New Contact Form Submission</h2>
          
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Name:</strong> ${fullName}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${phoneNumber}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
          </div>

          <div style="background: #fff; padding: 15px; border: 1px solid #eee; border-radius: 5px;">
            <p style="margin: 5px 0;"><strong>Message:</strong></p>
            <p style="white-space: pre-line;">${message}</p>
          </div>
        </div>
      `
    }

    // Send auto-reply from support email
    const customerMailOptions = {
      from: process.env.SUPPORT_EMAIL,
      to: email,
      subject: 'Thank you for contacting Taxi Ritje',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">Thank You for Contacting Us</h2>
          
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p>Dear ${fullName},</p>
            <p>Thank you for reaching out to us. We have received your message and will get back to you as soon as possible.</p>
            
            <p style="margin-top: 20px;">Your message details:</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-line;">${message}</p>
          </div>

          <div style="margin-top: 20px;">
            <p>If you need immediate assistance, please contact us at:</p>
            <p>Phone: ${process.env.SUPPORT_PHONE}</p>
            <p>Email: ${process.env.SUPPORT_EMAIL}</p>
          </div>
        </div>
      `
    }

    // Send both emails
    await Promise.all([
      transporter.sendMail(supportMailOptions),
      transporter.sendMail(customerMailOptions)
    ])

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Contact form submission error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    })
  }
}