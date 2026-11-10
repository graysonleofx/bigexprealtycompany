import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().regex(/^[\d\s\-\(\)\+]*$/, "Invalid phone number format").max(20, "Phone number too long").optional().or(z.literal("")),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().trim().min(1, "Message is required").max(2000, "Message must be less than 2000 characters"),
});

const contactInfo = [
  {
    icon: MapPin,
    title: "Visit Us",
    details: ["123 Luxury Avenue", "Beverly Hills, CA 90210"],
  },
  {
    icon: Phone,
    title: "Call Us",
    details: ["(123) 456-7890", "(123) 456-7891"],
  },
  {
    icon: Mail,
    title: "Email Us",
    details: ["info@prestigeestates.com", "sales@prestigeestates.com"],
  },
  {
    icon: Clock,
    title: "Office Hours",
    details: ["Mon - Fri: 9AM - 7PM", "Sat - Sun: 10AM - 5PM"],
  },
];

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast({
        title: "Please fix the form errors",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });

    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    setErrors({});
    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="bg-primary pb-12 pt-32 text-primary-foreground">
        <div className="site-container">
          <div className="max-w-3xl">
            <span className="section-eyebrow">
              Get In Touch
            </span>
            <h1 className="mt-2 text-4xl font-bold text-primary-foreground md:text-5xl">
              Contact Us
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/70">
              Have a question or want to schedule a viewing? Our team is here to
              help you every step of the way.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20">
        <div className="site-container">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              {contactInfo.map((info, index) => (
                <div
                  key={info.title}
                  className="flex gap-4 animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-gold/25 bg-gold/10">
                    <info.icon className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground">
                      {info.title}
                    </h3>
                    {info.details.map((detail) => (
                      <p key={detail} className="text-muted-foreground text-sm mt-1">
                        {detail}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl p-8 shadow-card animate-fade-up stagger-2">
                <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
                  Send Us a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="John Doe"
                        maxLength={100}
                        className={`w-full h-12 px-4 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring transition-smooth ${errors.name ? "border-destructive" : "border-input"}`}
                      />
                      {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="john@example.com"
                        maxLength={255}
                        className={`w-full h-12 px-4 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring transition-smooth ${errors.email ? "border-destructive" : "border-input"}`}
                      />
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="(123) 456-7890"
                        maxLength={20}
                        className={`w-full h-12 px-4 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring transition-smooth ${errors.phone ? "border-destructive" : "border-input"}`}
                      />
                      {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Subject *
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        className={`w-full h-12 px-4 rounded-lg border bg-background text-foreground focus:ring-2 focus:ring-ring transition-smooth ${errors.subject ? "border-destructive" : "border-input"}`}
                      >
                        <option value="">Select a subject</option>
                        <option value="buying">Buying a Property</option>
                        <option value="selling">Selling a Property</option>
                        <option value="renting">Renting a Property</option>
                        <option value="consultation">Free Consultation</option>
                        <option value="other">Other Inquiry</option>
                      </select>
                      {errors.subject && <p className="text-sm text-destructive">{errors.subject}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Message *
                    </label>
                    <textarea
                      rows={5}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Tell us how we can help you..."
                      maxLength={2000}
                      className={`w-full px-4 py-3 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring transition-smooth resize-none ${errors.message ? "border-destructive" : "border-input"}`}
                    />
                    {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
                  </div>

                  <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full md:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-5 w-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="h-96 bg-secondary">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d26430.393553120906!2d-118.4312329!3d34.0736204!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2bc04d6d147ab%3A0xd6c7c379fd081ed1!2sBeverly%20Hills%2C%20CA%2090210!5e0!3m2!1sen!2sus!4v1635959481000!5m2!1sen!2sus"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Office Location"
        />
      </section>

      <Footer />
    </main>
  );
};

export default Contact;
