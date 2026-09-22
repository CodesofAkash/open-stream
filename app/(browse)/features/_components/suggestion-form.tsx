"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { submitSuggestion } from "@/actions/suggestion";
import { contentConfig } from "@/lib/content-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send } from "lucide-react";

type SuggestionFormProps = {
  title?: string | null;
  description?: string | null;
};

// The heading and intro are editorial; the field labels stay constants because
// they are wired to the form's validation (AK-CMS-011).
export const SuggestionForm = ({ title, description }: SuggestionFormProps) => {
  const { features } = contentConfig;
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    title: "",
    description: "",
    category: "feature",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.title || !formData.description) {
      toast.error(features.suggestionForm.messages.error);
      return;
    }

    startTransition(() => {
      submitSuggestion(formData)
        .then(() => {
          toast.success(features.suggestionForm.messages.success);
          setFormData({
            name: "",
            email: "",
            title: "",
            description: "",
            category: "feature",
          });
        })
        .catch(() => {
          toast.error(features.suggestionForm.messages.failure);
        });
    });
  };

  return (
    <section>
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="space-y-3 pb-6">
          <div className="flex items-center gap-2">
            <Send className="w-6 h-6 text-primary" />
            <CardTitle className="text-2xl">{title ?? features.suggestionForm.title}</CardTitle>
          </div>
          <CardDescription className="text-base">
            {description ?? features.suggestionForm.description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">{features.suggestionForm.fields.name.label} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={features.suggestionForm.fields.name.placeholder}
                  disabled={isPending}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{features.suggestionForm.fields.email.label} *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={features.suggestionForm.fields.email.placeholder}
                  disabled={isPending}
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">{features.suggestionForm.fields.category.label} *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                disabled={isPending}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {features.suggestionForm.fields.category.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">{features.suggestionForm.fields.title.label} *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={features.suggestionForm.fields.title.placeholder}
                disabled={isPending}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{features.suggestionForm.fields.description.label} *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={features.suggestionForm.fields.description.placeholder}
                rows={features.suggestionForm.fields.description.rows}
                disabled={isPending}
                className="resize-none"
              />
            </div>

            <Button 
              type="submit" 
              disabled={isPending} 
              className="w-full h-11 text-base"
              size="lg"
            >
              {isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  {features.suggestionForm.submitButton.loading}
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  {features.suggestionForm.submitButton.default}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
};