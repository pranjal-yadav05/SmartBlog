"use client";

import Footer from "@/components/footer";
import { Header } from "@/components/header";

export default function Privacy() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Privacy Policy
              </h1>
              <p className="max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Your privacy is important to us. Learn how we collect, use, and protect your information.
              </p>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-950">
          <div className="container px-4 md:px-6 max-w-4xl">
            <div className="space-y-8 prose prose-lg dark:prose-invert max-w-none">
              <div>
                <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
                  <li>Name and email address when you create an account</li>
                  <li>Profile information you choose to provide</li>
                  <li>Content you post, including blog posts and comments</li>
                  <li>Information you provide when contacting us</li>
                </ul>
                <p className="text-gray-600 dark:text-gray-400 mt-4">
                  We also automatically collect certain information when you use our service, such as IP address, browser type, and usage data.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process your transactions and send related information</li>
                  <li>Send you technical notices and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Monitor and analyze trends and usage</li>
                  <li>Detect, prevent, and address technical issues</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">3. Information Sharing</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
                  <li>With your consent</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights and safety</li>
                  <li>With service providers who assist us in operating our platform</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">4. Data Security</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">5. Cookies and Tracking</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We use cookies and similar tracking technologies to track activity on our service and hold certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier.
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">6. Your Rights</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
                  <li>Access and receive a copy of your personal data</li>
                  <li>Rectify inaccurate personal data</li>
                  <li>Request deletion of your personal data</li>
                  <li>Object to processing of your personal data</li>
                  <li>Request restriction of processing your personal data</li>
                  <li>Data portability</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">7. Third-Party Services</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Our service may contain links to third-party websites or services that are not owned or controlled by SmartBlog. We have no control over, and assume no responsibility for, the privacy policies or practices of any third-party sites or services.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">8. Children's Privacy</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Our service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">9. Changes to This Policy</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">10. Contact Us</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  If you have any questions about this Privacy Policy, please contact us through our <a href="/contact" className="text-primary hover:underline">contact page</a>.
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

