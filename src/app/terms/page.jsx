"use client";

import Footer from "@/components/footer";
import { Header } from "@/components/header";

export default function Terms() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Terms of Service
              </h1>
              <p className="max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Please read these terms carefully before using SmartBlog
              </p>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-950">
          <div className="container px-4 md:px-6 max-w-4xl">
            <div className="space-y-8 prose prose-lg dark:prose-invert max-w-none">
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  1. Acceptance of Terms
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  By accessing and using SmartBlog, you accept and agree to be
                  bound by the terms and provision of this agreement.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">2. Use License</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Permission is granted to temporarily access the materials on
                  SmartBlog for personal, non-commercial transitory viewing
                  only. This is the grant of a license, not a transfer of title,
                  and under this license you may not:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
                  <li>Modify or copy the materials</li>
                  <li>
                    Use the materials for any commercial purpose or for any
                    public display
                  </li>
                  <li>
                    Attempt to reverse engineer any software contained on
                    SmartBlog
                  </li>
                  <li>
                    Remove any copyright or other proprietary notations from the
                    materials
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  When you create an account with us, you must provide
                  information that is accurate, complete, and current at all
                  times. You are responsible for safeguarding the password and
                  for all activities that occur under your account.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">4. User Content</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You retain ownership of any content you post on SmartBlog. By
                  posting content, you grant us a worldwide, non-exclusive,
                  royalty-free license to use, reproduce, and distribute your
                  content on the platform.
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You agree not to post content that:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
                  <li>Is illegal, harmful, or violates any laws</li>
                  <li>Infringes on the rights of others</li>
                  <li>Contains hate speech or discriminatory content</li>
                  <li>Is spam or contains malicious code</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">5. Prohibited Uses</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You may not use SmartBlog:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
                  <li>
                    In any way that violates any applicable law or regulation
                  </li>
                  <li>To transmit any malicious code or viruses</li>
                  <li>To collect or track personal information of others</li>
                  <li>To spam, phish, or engage in any fraudulent activity</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">6. Termination</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We may terminate or suspend your account and access to the
                  service immediately, without prior notice, for conduct that we
                  believe violates these Terms of Service or is harmful to other
                  users, us, or third parties.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">7. Disclaimer</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  The materials on SmartBlog are provided on an 'as is' basis.
                  SmartBlog makes no warranties, expressed or implied, and
                  hereby disclaims and negates all other warranties including,
                  without limitation, implied warranties or conditions of
                  merchantability, fitness for a particular purpose, or
                  non-infringement of intellectual property or other violation
                  of rights.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">8. Limitations</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  In no event shall SmartBlog or its suppliers be liable for any
                  damages (including, without limitation, damages for loss of
                  data or profit, or due to business interruption) arising out
                  of the use or inability to use the materials on SmartBlog.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">9. Changes to Terms</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We reserve the right to modify these terms at any time. We
                  will notify users of any material changes by posting the new
                  Terms of Service on this page. Your continued use of the
                  service after any such changes constitutes your acceptance of
                  the new Terms of Service.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">
                  10. Contact Information
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  If you have any questions about these Terms of Service, please
                  contact us through our{" "}
                  <a href="/contact" className="text-primary hover:underline">
                    contact page
                  </a>
                  .
                </p>
              </div>

              <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
