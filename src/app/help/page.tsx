"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Lock, CheckCircle, AlertTriangle, Phone, Mail, MessageCircle } from 'lucide-react';

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState('security');

  const categories = [
    { id: 'security', label: '🔒 Security & Safety', icon: Shield },
    { id: 'general', label: '❓ General Questions', icon: CheckCircle },
    { id: 'payment', label: '💳 Payment & Billing', icon: Lock },
    { id: 'technical', label: '🔧 Technical Support', icon: AlertTriangle },
  ];

  const faqData = {
    security: [
      {
        question: "Is FixMo safe to use?",
        answer: "Yes! FixMo is extremely secure. We use enterprise-grade security measures including AI-powered verification, encrypted data transmission, secure payment processing, and comprehensive fraud detection. Our platform has passed rigorous security audits and is 100% compliant with OWASP security standards."
      },
      {
        question: "How does the PWA installation work? Is it safe?",
        answer: "FixMo is a Progressive Web App (PWA) that installs directly from our secure website. This is actually safer than traditional app store apps because it requires HTTPS, runs in a secure sandbox, and automatically updates to the latest secure version. No need to go through app stores!"
      },
      {
        question: "How do you verify users are real?",
        answer: "We use advanced AI verification with 95%+ accuracy: Face detection, liveness detection (prevents photo spoofing), and anti-spoofing protection. Users can also verify with government ID, company ID, or passport. All verification data is encrypted and secure."
      },
      {
        question: "Is my payment information secure?",
        answer: "Absolutely! We use secure payment methods (GCash, PayMaya, GoTyme) with escrow protection. Your money is held safely until task completion. We never store sensitive payment details and all transactions are encrypted and logged for security."
      },
      {
        question: "What if someone tries to scam me?",
        answer: "Our AI-powered fraud detection system monitors all activities in real-time. We have escrow protection for payments, verified user profiles, and 24/7 support. If you encounter any issues, contact us immediately and we'll resolve it quickly."
      },
      {
        question: "How do you protect my personal data?",
        answer: "All data is encrypted in transit and at rest using enterprise-grade encryption. We follow strict privacy policies, never share your information with third parties, and comply with data protection regulations. You have full control over your data."
      }
    ],
    general: [
      {
        question: "How does FixMo work?",
        answer: "FixMo connects you with trusted neighbors in Cebu City for tasks and services. Post a task, get matched with verified taskers, pay securely through escrow, and get your work done safely!"
      },
      {
        question: "What types of tasks can I post?",
        answer: "You can post almost any task: cleaning, organizing, repairs, errands, tutoring, pet care, event help, and more. Just make sure it's legal and safe!"
      },
      {
        question: "How much does it cost to use FixMo?",
        answer: "Posting tasks is free! We only charge a small platform fee (5%) when a task is completed. This helps us maintain security, verification, and support services."
      },
      {
        question: "What if I'm not satisfied with the work?",
        answer: "We have a satisfaction guarantee! If you're not happy with the work, contact us within 24 hours. We'll help resolve the issue or provide a refund through our escrow system."
      },
      {
        question: "Can I cancel a task after booking?",
        answer: "Yes, you can cancel tasks before they start. Cancellation policies vary by tasker, but we always ensure fair treatment for both parties."
      }
    ],
    payment: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept GCash, PayMaya, GoTyme, cash, and bank transfers. All digital payments are processed securely through our escrow system."
      },
      {
        question: "How does the escrow system work?",
        answer: "When you pay for a task, your money is held securely in escrow until the task is completed. Once you approve the work, the payment is released to the tasker. This protects both parties!"
      },
      {
        question: "How long does payment confirmation take?",
        answer: "Digital payments are usually confirmed within 5-15 minutes after we receive your payment proof. Cash payments are confirmed immediately upon receipt."
      },
      {
        question: "What if I pay the wrong amount?",
        answer: "Contact us immediately! We can adjust the payment or process a refund. Each payment has a unique reference number to prevent confusion."
      },
      {
        question: "Is there a refund policy?",
        answer: "Yes! We offer refunds for cancelled tasks, unsatisfactory work, or technical issues. Contact our support team and we'll process your refund quickly."
      }
    ],
    technical: [
      {
        question: "The app won't install on my phone",
        answer: "Make sure you're using a modern browser (Chrome, Safari, Firefox). For Android, use Chrome. For iPhone, use Safari. The app requires HTTPS to install."
      },
      {
        question: "I can't log in to my account",
        answer: "Try resetting your password or contact support. Make sure you're using the correct email address and that your account is verified."
      },
      {
        question: "The verification process isn't working",
        answer: "Ensure good lighting, clean camera lens, and stable internet connection. Make sure you're using HTTPS and have granted camera permissions. Try the ID verification option, visit /test-camera to debug camera issues, or check our detailed camera help guide at /camera-help. If problems persist, contact support."
      },
      {
        question: "I'm not receiving notifications",
        answer: "Check your phone's notification settings for the browser/app. Make sure you've granted notification permissions when prompted."
      },
      {
        question: "The app is running slowly",
        answer: "Try refreshing the page, clearing browser cache, or restarting your device. Ensure you have a stable internet connection."
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Help & Support Center
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get answers to your questions and learn about FixMo's security features. 
            We're here to help you use our platform safely and confidently.
          </p>
        </div>

        {/* Security Badge */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-green-800">
                🔒 FixMo is Enterprise-Grade Secure
              </h3>
              <p className="text-green-700">
                Our platform has passed comprehensive security audits and uses military-grade encryption. 
                Your safety is our top priority.
              </p>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                onClick={() => setActiveCategory(category.id)}
                className="flex items-center space-x-2"
              >
                <Icon className="h-4 w-4" />
                <span>{category.label}</span>
              </Button>
            );
          })}
        </div>

        {/* FAQ Content */}
        <div className="space-y-6">
          <Accordion type="single" collapsible className="w-full">
            {faqData[activeCategory as keyof typeof faqData].map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  <span className="font-medium text-gray-900">{item.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Security Features Highlight */}
        {activeCategory === 'security' && (
          <Card className="mt-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <Shield className="h-5 w-5" />
                <span>Security Features Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">AI-Powered Verification (95%+ accuracy)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">HTTPS-Only PWA Installation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Enterprise-Grade Encryption</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Secure Payment Escrow System</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Real-Time Fraud Detection</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">OWASP Top 10 Compliance</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Support */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Still Need Help?</span>
            </CardTitle>
            <CardDescription>
              Our support team is here to help you 24/7
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Phone className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <h4 className="font-medium">Phone Support</h4>
                <p className="text-sm text-gray-600">09565121085</p>
                <p className="text-xs text-gray-500">9 AM - 6 PM (PHT)</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Mail className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <h4 className="font-medium">Email Support</h4>
                <p className="text-sm text-gray-600">support@fixmo.com</p>
                <p className="text-xs text-gray-500">24/7 Response</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <MessageCircle className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <h4 className="font-medium">In-App Chat</h4>
                <p className="text-sm text-gray-600">Live Support</p>
                <p className="text-xs text-gray-500">Instant Response</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 