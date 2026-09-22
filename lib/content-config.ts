// Centralized content configuration for legal pages and features
import { SITE_URL } from "@/lib/site-url";

export const contentConfig = {
  // Project metadata
  project: {
    name: "OpenStream",
    // Derived from the deployment, never hardcoded — see lib/site-url.ts.
    baseUrl: SITE_URL,
    githubUrl: "https://github.com/CodesofAkash/open-stream",
    email: {
      support: "akashcodesharma@gmail.com",
      privacy: "akashcodesharma@gmail.com",
    }
  },

  // About page content
  about: {
    title: "About OpenStream",
    description: "Learn about the project and the developer behind it",
    hero: {
      title: "About OpenStream",
      subtitle:
        "An open-source live streaming platform built as a learning project to explore real-time web technologies and modern full-stack development.",
    },
    mission: {
      title: "Project Goal",
      paragraphs: [
        "OpenStream is built to explore how modern live streaming platforms work under the hood, including video ingestion, real-time playback, and live user interaction.",
        "This project focuses on applying current full-stack development best practices while building a production-like system for learning and portfolio purposes.",
      ],
    },
    techStack: {
      title: "Technology Stack",
      items: [
        { name: "Next.js 16", description: "React framework with App Router" },
        { name: "LiveKit", description: "Real-time video streaming" },
        { name: "Clerk", description: "Authentication & user management" },
        { name: "Prisma", description: "Type-safe database ORM" },
        { name: "PostgreSQL", description: "Relational database" },
        { name: "Tailwind CSS", description: "Utility-first styling" },
      ],
    },
    features: {
      title: "Key Features",
      items: [
        "Real-time live streaming",
        "Interactive chat",
        "Categories & tags",
        "Follow system",
        "Creator dashboard",
        "Search & discovery",
      ],
    },
    openSource: {
      title: "Open Source",
      description:
        "OpenStream is an open-source educational project. The codebase demonstrates modern web development patterns and real-time streaming concepts such as:",
      badges: [
        "Server Components",
        "Server Actions",
        "WebRTC Streaming",
        "Type Safety",
        "Responsive Design",
        "Dark Mode",
      ],
      githubButtonText: "View on GitHub",
    },
    cta: {
      title: "Want to Learn More?",
      subtitle: "Explore the roadmap, contribute to the project, or get in touch with feedback and ideas",
      buttons: {
        features: "Features & Roadmap",
        contact: "Contact",
      },
    },
  },


  // Contact page content
  contact: {
    title: "Contact | OpenStream",
    description: "Get in touch with the developer behind OpenStream",
    hero: {
      title: "Get in Touch",
      subtitle: "Have feedback, suggestions, or questions? Feel free to reach out.",
    },
    methods: [
      {
        icon: "Mail",
        title: "Email",
        description: "Best way to reach me directly",
        link: "mailto:akashcodesharma@gmail.com",
        linkText: "akashcodesharma@gmail.com",
      },
      {
        icon: "MessageSquare",
        title: "Community",
        description: "Join discussions or follow updates",
        buttonText: "Community Link",
        link: "https://x.com/CodesOfAkash", // Discord/Twitter/etc (optional)
      },
      {
        icon: "Github",
        title: "GitHub Issues",
        description: "Report bugs or suggest improvements",
        buttonText: "Open Issue",
        link: "https://github.com/CodesofAkash/open-stream/issues",
      },
    ],
    form: {
      title: "Send a Message",
      description: "This form is for demo purposes unless connected to a backend service",
      fields: {
        name: { label: "Name", placeholder: "Your name", required: true },
        email: { label: "Email", placeholder: "you@example.com", required: true },
        subject: { label: "Subject", placeholder: "How can I help?", required: true },
        message: { label: "Message", placeholder: "Tell me more...", rows: 6, required: true },
      },
      submitButton: "Send Message",
    },
  },


  // Privacy page content
  privacy: {
    title: "Privacy Policy | OpenStream",
    description: "How user data is handled in this demo project",
    hero: {
      title: "Privacy Policy",
      subtitle:
        "This privacy policy is provided for demonstration purposes as part of an educational project.",
      lastUpdated: true,
    },
    quickOverview: [
      {
        icon: "Lock",
        title: "Best Practices",
        description: "This project follows common security best practices where applicable.",
      },
      {
        icon: "Eye",
        title: "Transparency",
        description: "We aim to be transparent about what data is collected in this demo application.",
      },
      {
        icon: "FileText",
        title: "Your Rights",
        description: "You can request deletion of your account data during development/testing.",
      },
    ],
    sections: [
      {
        title: "1. Information We Collect",
        description: "What data may be collected when you use OpenStream",
        subsections: [
          {
            title: "Account Information",
            items: [
              "Username and email address",
              "Profile picture and bio (if provided)",
              "Account preferences and settings",
            ],
          },
          {
            title: "Usage Data",
            items: [
              "Streams you watch and create",
              "Chat messages and interactions",
              "Follow and block relationships",
            ],
          },
          {
            title: "Technical Data",
            items: [
              "Basic device and browser information",
              "Anonymous usage analytics for learning purposes",
            ],
          },
        ],
      },
      {
        title: "2. How We Use Your Information",
        description: "Why data is processed in this project",
        items: [
          "To provide core application functionality",
          "To improve features and user experience during development",
          "To debug issues and improve performance",
        ],
      },
      {
        title: "3. Data Sharing",
        description: "Who may have access to your information",
        intro: "This project does not sell user data.",
        shareText: "Data may be processed by:",
        items: [
          {
            label: "Third-Party Services:",
            text: "Authentication and streaming providers used for development",
          },
          {
            label: "Legal Requirements:",
            text: "If required by law",
          },
        ],
      },
      {
        title: "4. Your Privacy Rights",
        description: "What you can do with your data",
        rights: [
          {
            title: "Access",
            description: "Request a copy of the data associated with your account",
          },
          {
            title: "Correction",
            description: "Update inaccurate or incomplete information",
          },
          {
            title: "Deletion",
            description: "Request deletion of your account during development",
          },
        ],
      },
      {
        title: "5. Contact",
        description: "Questions about privacy?",
        contactText:
          "For privacy-related inquiries, please contact the developer using the contact details provided on the Contact page.",
      },
    ],
  },


  // Terms page content
  terms: {
    title: "Terms of Service | OpenStream",
    description: "Terms for using the OpenStream demo application",
    hero: {
      title: "Terms of Service",
      subtitle:
        "These terms are provided for demonstration purposes for this educational project.",
      lastUpdated: true,
    },
    alert: {
      message:
        "By using OpenStream, you acknowledge that this is a demo/portfolio project and not a production service.",
    },
    sections: [
      {
        title: "1. User Accounts",
        icon: "UserCheck",
        description: "Account usage in this demo application",
        intro: "When creating an account, you agree to:",
        items: [
          "Provide accurate information for testing purposes",
          "Not misuse the platform or attempt to exploit vulnerabilities",
          "Respect other users during testing and development",
        ],
      },
      {
        title: "2. Content Guidelines",
        icon: "FileText",
        description: "Acceptable use of the platform",
        subsections: [
          {
            title: "Prohibited Content",
            intro: "You must NOT stream or share:",
            items: [
              "Illegal content",
              "Harmful or abusive material",
              "Content that violates copyright laws",
            ],
          },
          {
            title: "Required Conduct",
            intro: "You must:",
            items: [
              "Respect other users",
              "Use the platform responsibly",
              "Follow applicable laws",
            ],
          },
        ],
      },
      {
        title: "3. Intellectual Property",
        description: "Rights and licenses",
        paragraphs: [
          {
            text:
              "You retain ownership of content you create. By using OpenStream, you grant permission to display your content within the application for demonstration purposes.",
            bold: "You retain ownership",
          },
        ],
        items: [
          "Display your content within the platform",
          "Show previews and thumbnails",
        ],
        footer:
          "This permission applies only within the context of this demo project.",
      },
      {
        title: "4. Account Termination",
        intro: "Accounts may be removed during development if they:",
        items: [
          "Violate platform guidelines",
          "Are used for abuse or testing exploits",
          "Remain inactive for long periods during development cycles",
        ],
        footer:
          "Accounts may be reset during major development updates.",
      },
      {
        title: "5. Disclaimer",
        intro:
          'OpenStream is provided "as is" for educational purposes. The developer is not responsible for:',
        items: [
          "Data loss during testing",
          "Service interruptions",
          "Unexpected bugs or downtime",
        ],
        footer:
          "No warranties are provided for this demo application.",
      },
      {
        title: "6. Changes to Terms",
        text:
          "These terms may change as the project evolves. Continued use of OpenStream implies acceptance of updated terms.",
      },
    ],
  },


  // Features page content
  features: {
    title: "Features & Roadmap | OpenStream",
    description: "Explore current features and upcoming improvements",
    hero: {
      title: "Features & Roadmap",
      subtitle: "Discover what OpenStream offers today and what's coming next",
    },
    currentFeatures: {
      title: "What We Offer Today",
      subtitle:
        "OpenStream is powered by cutting-edge technologies to deliver the best streaming experience",
    },
    futureFeatures: {
      title: "Coming Soon",
      subtitle: "Exciting features we're working on to make OpenStream even better",
      priorities: {
        High: "Actively working on these",
        Medium: "Next on our roadmap",
        Future: "Long-term vision",
      },
    },
    github: {
      title: "Contribute on GitHub",
      description:
        "OpenStream is open-source! Help us build the future of live streaming by contributing to our project.",
      buttonText: "View Repository",
    },
    suggestionForm: {
      title: "Share Your Ideas",
      description:
        "Have a feature request or found a bug? We'd love to hear from you! Your feedback helps us build a better platform.",
      fields: {
        name: { label: "Name", placeholder: "Your name", required: true },
        email: { label: "Email", placeholder: "you@example.com", required: true },
        category: {
          label: "Category",
          options: [
            { value: "feature", label: "✨ New Feature" },
            { value: "improvement", label: "🚀 Improvement" },
            { value: "bug", label: "🐛 Bug Report" },
          ],
          required: true,
        },
        title: { label: "Title", placeholder: "Brief description of your suggestion", required: true },
        description: {
          label: "Description",
          placeholder: "Tell us more about your idea or the issue you encountered...",
          rows: 6,
          required: true,
        },
      },
      submitButton: {
        default: "Submit Suggestion",
        loading: "Submitting...",
      },
      messages: {
        error: "Please fill in all fields",
        success: "Suggestion submitted! Thank you for your feedback.",
        failure: "Failed to submit suggestion. Please try again.",
      },
    },
  },
};
