"use client";

import { useState, FormEvent } from "react";
import { Loader2, Send } from "lucide-react";
import emailjs from "@emailjs/browser";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { contentConfig } from "@/lib/content-config";

/**
 * The message form.
 *
 * Its title and description come from the CMS; the field labels, placeholders
 * and submit label stay frontend constants. That is the line AK-CMS-011 draws:
 * editorial copy is editable, functional microcopy wired to validation is not.
 */
type Props = {
  title?: string | null;
  description?: string | null;
};

export const ContactForm = ({ title, description }: Props) => {
  const { form } = contentConfig.contact;
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

      if (!serviceId || !templateId || !publicKey) {
        throw new Error("EmailJS is not configured");
      }

      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject,
          message: formData.message,
          to_name: "Akash Sharma",
          // The template's Reply-To is {{reply_to}}; without this, replying to
          // a contact email goes back to yourself instead of the sender.
          reply_to: formData.email,
        },
        publicKey
      );

      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Email send error:", error);
      toast.error("Failed to send message. Please try again or contact us directly via email.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        {title ? <CardTitle className="text-2xl">{title}</CardTitle> : null}
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{form.fields.name.label} *</Label>
              <Input
                id="name"
                placeholder={form.fields.name.placeholder}
                className="h-11"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{form.fields.email.label} *</Label>
              <Input
                id="email"
                type="email"
                placeholder={form.fields.email.placeholder}
                className="h-11"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">{form.fields.subject.label} *</Label>
            <Input
              id="subject"
              placeholder={form.fields.subject.placeholder}
              className="h-11"
              value={formData.subject}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">{form.fields.message.label} *</Label>
            <Textarea
              id="message"
              placeholder={form.fields.message.placeholder}
              rows={form.fields.message.rows}
              className="resize-none"
              value={formData.message}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full h-11" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 size-4" />
                {form.submitButton}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
