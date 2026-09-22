"use client";

import { useState, FormEvent } from "react";
import { Mail, MessageSquare, Send, Loader2 } from "lucide-react";
import { Github } from "@/components/icons/github";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { contentConfig } from "@/lib/content-config";
import emailjs from "@emailjs/browser";
import { toast } from "sonner";

export default function ContactPage() {
  const { contact } = contentConfig;
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
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "service_s3inyje";
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "template_neayvk7";
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "eFGhotqAWABe54T";
      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject,
          message: formData.message,
          to_name: "Akash Sharma",
        },
        publicKey
      );

      toast.success("Message sent successfully! We'll get back to you soon.");
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
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
    <article className="space-y-12">
      {/* Hero */}
      <header className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Send className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold">{contact.hero.title}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {contact.hero.subtitle}
        </p>
      </header>

      {/* Contact Methods */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="hover:border-primary/50 transition-all hover:shadow-md">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>{contact.methods[0].title}</CardTitle>
            <CardDescription>{contact.methods[0].description}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <a
              href={contact.methods[0].link}
              className="text-primary hover:underline font-medium"
            >
              {contact.methods[0].linkText}
            </a>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-all hover:shadow-md">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>{contact.methods[1].title}</CardTitle>
            <CardDescription>{contact.methods[1].description}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="outline" asChild className="w-full">
              <a href={contact.methods[1].link} target="_blank" rel="noopener noreferrer">
                {contact.methods[1].buttonText}
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-all hover:shadow-md">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-4">
              <Github className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>{contact.methods[2].title}</CardTitle>
            <CardDescription>{contact.methods[2].description}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="outline" asChild className="w-full">
              <a href={contact.methods[2].link} target="_blank" rel="noopener noreferrer">
                {contact.methods[2].buttonText}
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Contact Form */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{contact.form.title}</CardTitle>
          <CardDescription>{contact.form.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{contact.form.fields.name.label} *</Label>
                <Input 
                  id="name" 
                  placeholder={contact.form.fields.name.placeholder} 
                  className="h-11"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{contact.form.fields.email.label} *</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder={contact.form.fields.email.placeholder} 
                  className="h-11"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">{contact.form.fields.subject.label} *</Label>
              <Input 
                id="subject" 
                placeholder={contact.form.fields.subject.placeholder} 
                className="h-11"
                value={formData.subject}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">{contact.form.fields.message.label} *</Label>
              <Textarea
                id="message"
                placeholder={contact.form.fields.message.placeholder}
                rows={contact.form.fields.message.rows}
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  {contact.form.submitButton}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </article>
  );
}