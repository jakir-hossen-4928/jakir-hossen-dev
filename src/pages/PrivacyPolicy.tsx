import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Shield, Lock, Eye, Server, Globe } from 'lucide-react';

const PrivacyPolicy = () => {
    usePageTitle("Privacy Policy | Sajuriya Studio");

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            <main className="container mx-auto px-4 py-32 max-w-4xl">
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight">Privacy Policy</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        We value your privacy and are committed to protecting your personal data. This policy outlines how we handle your information.
                    </p>
                </div>

                <div className="space-y-8">
                    <Card className="p-8 md:p-12 rounded-[32px] border-border/50 bg-card/50 backdrop-blur-sm space-y-8">

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <Shield className="text-primary" /> 1. Introduction
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                This Privacy Policy applies to the apps and services offered by Sajuriya Studio ("we," "our," or "us").
                                By downloading, installing, or using our applications, you agree to the collection and use of information in accordance with this policy.
                                We are committed to ensuring that your privacy is protected and respected.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <Eye className="text-primary" /> 2. Information We Collect
                            </h2>
                            <div className="space-y-4 text-muted-foreground leading-relaxed">
                                <p>We may collect the following types of information:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Personal Information:</strong> When you voluntarily provide it (e.g., email address for newsletters, beta testing, or feedback).</li>
                                    <li><strong>Device Information:</strong> We may collect generic device information such as model, operating system version, and unique device identifiers to optimize app performance.</li>
                                    <li><strong>Usage Data:</strong> Information about how you use our apps, including feature usage, crash logs, and performance metrics, collected via third-party services like Firebase Analytics.</li>
                                </ul>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <Server className="text-primary" /> 3. How We Use Your Information
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                The information we collect is used to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                                <li>Provide, maintain, and improve our applications.</li>
                                <li>Respond to your comments, questions, and support requests.</li>
                                <li>Monitor and analyze usage and trends to enhance user experience.</li>
                                <li>Send you technical notices, updates, security alerts, and administrative messages.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <Globe className="text-primary" /> 4. Third-Party Services
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We may use third-party services that may collect information used to identify you.
                                Please refer to the privacy policies of these third-party service providers:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                                <li>
                                    <a href="https://firebase.google.com/policies/analytics" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        Google Analytics for Firebase
                                    </a>
                                </li>
                                <li>
                                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        Google Play Services
                                    </a>
                                </li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <Lock className="text-primary" /> 5. Data Security
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
                                However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold">6. Children's Privacy</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Our services do not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13.
                                If we discover that a child under 13 has provided us with personal information, we immediately delete this from our servers.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold">7. Changes to This Privacy Policy</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We may update our Privacy Policy from time to time. Thus, you are advised to review this page periodically for any changes.
                                We will notify you of any changes by posting the new Privacy Policy on this page. These changes are effective immediately after they are posted.
                            </p>
                        </section>

                        <section className="space-y-4 pt-4 border-t border-border/50">
                            <h2 className="text-2xl font-bold">Contact Us</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at: <a href="mailto:mdjakirkhan4928@gmail.com" className="text-primary hover:underline">mdjakirkhan4928@gmail.com</a>
                            </p>
                        </section>

                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
