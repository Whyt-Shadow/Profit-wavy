import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export default function TermsModal({ isOpen, onClose, title }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl max-h-[80vh] bg-[#0a0a0a] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-8 border-b border-white/10 flex items-center justify-between bg-[#0a0a0a]/50 backdrop-blur-xl">
              <h2 className="text-2xl font-black font-display uppercase italic tracking-tight text-white">{title}</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar text-gray-400 font-medium leading-relaxed space-y-6 text-sm">
              <div className="prose prose-invert max-w-none">
                <h4>1. Investment Terms and Risk Disclosure</h4>
                <p>
                  All investments offered, facilitated, or referenced through our platform are subject to inherent and significant market risks, including but not limited to the potential for partial or total loss of principal capital. It is of paramount importance for every investor, regardless of experience level, to understand that the valuation of financial instruments—including stocks, bonds, mutual funds, exchange-traded funds (ETFs), options, cryptocurrencies, and any other asset class—fluctuates continuously due to a complex interplay of macroeconomic forces, geopolitical events, sector-specific developments, corporate performance, interest rate changes, inflationary pressures, and broader market sentiment. These fluctuations are unpredictable and can result in rapid and substantial declines in portfolio value.
                </p>
                <p>
                  Past performance, whether cited for an individual security, a managed portfolio, a market index, or the platform’s own historical returns, is strictly <strong>not indicative, representative, or predictive of future results or performance.</strong> Historical data is provided for informational and contextual purposes only and should not be construed as a guarantee, promise, or reliable forecast of future profitability. Markets operate in cycles, and conditions that drove positive returns in one period may not only cease to exist but may reverse sharply. An investment that has appreciated consistently for years can suddenly depreciate due to unforeseen circumstances.
                </p>
                <p>
                  Investors must carefully consider their personal financial situation, investment objectives, time horizon, and risk tolerance before committing capital. A fundamental principle of prudent investing is diversification—spreading investments across various asset classes, industries, and geographical regions to mitigate the impact of a decline in any single holding. However, even diversified portfolios are not immune from systemic risk, where broad market downturns affect nearly all asset classes simultaneously.
                </p>
                <p>
                  We do not provide personalized investment advice, financial planning services, or tailored recommendations. The tools, research, analytics, and educational content available on our platform are for informational and self-directed decision-making support only. Any decision to buy, sell, or hold an investment is solely the investor's responsibility. For specific advice, you should consult with a qualified, independent financial advisor who can assess your individual circumstances.
                </p>
                <p>
                  Furthermore, certain investment products, particularly alternative assets like cryptocurrencies, commodities, or derivatives, may carry elevated risks, including higher volatility, lower liquidity, regulatory uncertainty, and technological vulnerabilities. The potential for greater returns is commensurate with this higher risk profile. You acknowledge that you are solely responsible for conducting your own due diligence on any investment opportunity.
                </p>
                <p>
                  By using our platform, you explicitly acknowledge and accept that you could lose money, including your entire initial investment, and that neither the platform nor its affiliates, directors, or employees are liable for any losses, damages, or opportunity costs incurred as a result of your investment decisions or market movements. Investment is not suitable for funds you cannot afford to lose, such as emergency savings, retirement essentials, or funds earmarked for short-term liabilities like tuition or mortgage payments.
                </p>

                <h4>2. Comprehensive Account Security and User Responsibilities</h4>
                <p>
                  The security of your financial and personal data is a shared responsibility. While we implement and maintain robust, industry-standard technical safeguards—including bank-level 256-bit SSL encryption for data in transit, AES-256 encryption for data at rest, multi-layered firewall protection, intrusion detection and prevention systems, and regular third-party security audits—the integrity of your account is fundamentally dependent on your personal security practices.
                </p>
                <p>
                  You bear the <strong>exclusive and non-transferable responsibility</strong> for maintaining the absolute confidentiality and security of your login credentials, which include your username, password, personal identification number (PIN), and any other codes or authentication methods we provide. This obligation extends to any linked email account used for account recovery or communication. You must not, under any circumstances, disclose these credentials to any third party, including family members, friends, or financial advisors. You are deemed to be the sole authorized user of your account, and any activity conducted through your authenticated login will be presumed to be your own.
                </p>
                <p>To mitigate risks, you agree to:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Create a <strong>strong, unique password</strong> that is not used for any other online service. A strong password typically exceeds 12 characters and includes a complex mix of uppercase letters, lowercase letters, numbers, and symbols.</li>
                  <li><strong>Never store</strong> your password in plaintext in digital files (like notes apps or documents), browsers, or shared password managers that are not securely encrypted.</li>
                  <li><strong>Immediately notify us</strong> of any unauthorized access attempt, any suspicious activity on your account (such as unfamiliar transactions or changes to your contact information), or any loss, theft, or potential compromise of your credentials. Notification must be sent via our official support channels without delay.</li>
                  <li><strong>Utilize all available enhanced security features</strong> we offer, such as Two-Factor Authentication (2FA) or Multi-Factor Authentication (MFA). If you opt not to enable these features, you knowingly accept a higher degree of risk for which we cannot be held accountable.</li>
                  <li>Ensure the security of the devices you use to access our platform. This includes using updated operating systems, installing reputable anti-virus and anti-malware software, and avoiding the use of public or unsecured Wi-Fi networks for financial transactions. You are responsible for logging out of your account at the end of every session, especially on shared or public computers.</li>
                </ul>
                <p>
                  We will never initiate contact via email, phone, or text to request your password or 2FA codes. You are responsible for recognizing and avoiding phishing attempts, spoofed websites, and social engineering attacks designed to steal your credentials. Failure to adhere to these security protocols may result in compromised account security and financial loss, for which we explicitly disclaim liability.
                </p>

                <h4>3. Detailed Withdrawal Procedures, Timelines, and Verification Protocols</h4>
                <p>
                  While we strive to make funds from your investments available for withdrawal in a timely manner, all withdrawal requests are subject to a standard processing period of <strong>1 to 24 business hours</strong> from the time of a verified and approved request. This period is necessary to ensure the integrity of the transaction, reconcile accounts, and prevent fraudulent activity. "Business hours" typically refer to standard banking days (Monday through Friday, excluding federal holidays) and hours (e.g., 9:00 AM to 5:00 PM in the platform's operating time zone). A request submitted outside of these hours may not begin processing until the next business day.
                </p>
                <p>The processing timeline is influenced by several factors:</p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li><strong>Internal Security and Compliance Review:</strong> Every withdrawal is automatically screened by our risk and fraud prevention systems for unusual patterns or red flags.</li>
                  <li><strong>Method of Withdrawal:</strong> The destination of your funds (e.g., a linked bank account via ACH, an external wallet for crypto assets, a wire transfer) impacts processing time. Domestic ACH transfers generally process faster than international wire transfers, which involve intermediary banks and foreign regulations.</li>
                  <li><strong>Withdrawal Amount:</strong> We explicitly reserve the right to subject <strong>large withdrawals</strong>, or withdrawals that deviate significantly from your historical account activity, to <strong>additional verification procedures</strong>. This is a critical anti-money laundering (AML) and fraud prevention measure, as well as a safeguard for your assets against unauthorized account takeovers. A "large withdrawal" is defined dynamically based on your account profile, typical activity, and risk models, not a single published threshold.</li>
                </ol>
                <p>Additional verification may involve, but is not limited to:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Requesting recently dated proof of identity (e.g., government-issued photo ID, passport).</li>
                  <li>Requesting proof of address (e.g., utility bill, bank statement).</li>
                  <li>Requiring you to re-authenticate via a fresh 2FA code or biometric verification.</li>
                  <li>Initiating a direct phone call to your number on file for verbal confirmation.</li>
                  <li>Placing a temporary hold on the withdrawal request pending the satisfactory completion of this review.</li>
                </ul>
                <p>
                  You agree to cooperate promptly with any such verification requests. Delays in providing requested documentation will directly result in delays in processing your withdrawal. These measures are in place to protect you, our user base, and the platform from financial crime and are non-negotiable.
                </p>
                <p>
                  Furthermore, you are responsible for ensuring the absolute accuracy of the withdrawal destination details (e.g., bank account number, wallet address). We are not liable for funds sent to incorrect or outdated information provided by you. Once a withdrawal is approved and initiated to a correct external destination, we cannot reverse it; recovery becomes your responsibility to undertake with the receiving institution.
                </p>

                <h4>4. Transparent Fee Structure and Billing Policy</h4>
                <p>
                  We are committed to full transparency regarding all costs associated with using our platform. Our standard policy is to charge <strong>no fees for deposits or standard withdrawals</strong> to approved payment methods. This means you can fund your account and withdraw your available balance via our primary methods without incurring a charge from us.
                </p>
                <p>However, it is essential to understand the following nuances:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Third-Party Fees:</strong> While we may not charge a fee, your financial institution (bank, credit card issuer, payment processor) or network (blockchain for crypto) may impose its own charges for transferring funds. These include, but are not limited to, wire transfer fees, credit card cash advance fees, or network gas/transaction fees. You are solely responsible for understanding and paying any such third-party fees, which will be deducted by the entity charging them, not by us.</li>
                  <li><strong>Non-Standard Transaction Fees:</strong> Certain specialized transactions or services may incur clearly disclosed fees. Examples might include expedited processing for a withdrawal (if offered), currency conversion on international transfers, paper statement requests, or fees associated with specific investment products (like expense ratios for funds, which are detailed in their prospectuses).</li>
                  <li><strong>Clear Disclosure:</strong> In accordance with best practices and regulatory guidance, <strong>all applicable fees will be clearly, conspicuously, and unambiguously disclosed to you before you finalize and confirm any transaction.</strong> You will be presented with a complete breakdown, including the transaction amount, any our fee, an estimate of any third-party fee (if known), and the net total. Your explicit confirmation constitutes acknowledgment and acceptance of these fees.</li>
                  <li><strong>Fee Schedule Changes:</strong> We reserve the right to modify our fee structure with advance notice. Any changes will be communicated to you via email and/or platform notification with a reasonable notice period (typically 30 days), giving you the opportunity to review the changes and decide whether to continue using the affected services.</li>
                </ul>
                <p>
                  You are encouraged to review the most current fee schedule, available in the "Help" or "Pricing" section of our platform, regularly.
                </p>

                <h4>5. Extensive Privacy Policy Overview and Data Practices</h4>
                <p>
                  Protecting your privacy and the security of your personal information is a cornerstone of our operations. Our comprehensive Privacy Policy, which is incorporated into these Terms by reference, governs the collection, use, disclosure, and protection of your data. By using our platform, you consent to the data practices described therein.
                </p>
                <h6>Data We Collect:</h6>
                <p>We collect information necessary to provide our services, comply with legal obligations, and improve your experience. This includes:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Personal Identification Information:</strong> Name, date of birth, government-issued identification numbers (e.g., Social Security Number for tax purposes, where legally required), photographic identification, and proof of address.</li>
                  <li><strong>Financial Information:</strong> Bank account details, payment card information (processed securely by our PCI-DSS compliant partners), transaction history, investment portfolio composition, and income/wealth indicators used for suitability assessments.</li>
                  <li><strong>Technical and Usage Data:</strong> IP address, device type and identifiers, browser information, log data, cookies, and pixel tags. We track how you navigate and interact with our platform to analyze trends, administer the site, and gather demographic information.</li>
                  <li><strong>Communications:</strong> Records of your correspondence with our support team, survey responses, and recorded phone calls (where applicable and with notice for quality assurance and training).</li>
                </ul>
                <h6>How We Use Your Information:</h6>
                <p>Your information is used for specific, legitimate purposes, including:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>To open, maintain, and service your account.</li>
                  <li>To verify your identity and comply with global "Know Your Customer" (KYC) and Anti-Money Laundering (AML) regulations.</li>
                  <li>To process your transactions (deposits, investments, withdrawals) and generate necessary tax documents.</li>
                  <li>To communicate with you about your account, platform updates, security alerts, and customer support.</li>
                  <li>To personalize your experience and develop new products, services, and features.</li>
                  <li>To detect, prevent, and investigate fraud, security breaches, and other prohibited or illegal activities.</li>
                  <li>To fulfill other legal and regulatory obligations imposed upon us as a financial services provider.</li>
                </ul>
                <h6>Information Sharing and Disclosure:</h6>
                <p>We do not sell your personal information to third-party marketers. We may share your data only in the following limited circumstances:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>With Service Providers:</strong> Trusted third-party vendors who perform essential functions on our behalf (e.g., cloud hosting, payment processing, identity verification, customer communication, analytics). These partners are contractually bound to use your data only for the services we request and to protect it to our standards.</li>
                  <li><strong>For Legal and Compliance Reasons:</strong> When required by law, subpoena, court order, or regulatory authority; to enforce our Terms of Service; to protect the rights, property, or safety of our company, our users, or the public.</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, sale of assets, or bankruptcy, your information may be transferred as a business asset, subject to the promises made in the prevailing Privacy Policy.</li>
                  <li><strong>With Your Consent:</strong> For any other purpose, we will explicitly ask for and obtain your opt-in consent.</li>
                </ul>
                <h6>Data Security, Retention, and Your Rights:</h6>
                <p>
                  We employ physical, electronic, and procedural safeguards that meet or exceed industry standards. We retain your personal information only for as long as necessary to fulfill the purposes outlined in our Privacy Policy, comply with legal retention requirements (which for financial records can be many years), resolve disputes, and enforce our agreements.
                </p>
                <p>
                  Depending on your jurisdiction, you may have certain data privacy rights, such as the right to access, correct, delete, or port your data, or to object to or restrict certain processing. You can typically manage your communication preferences and certain profile information directly within your account settings. For other requests, you must contact our Data Protection Officer via the methods outlined in the full Privacy Policy.
                </p>
                <p>
                  This document, in conjunction with our full Privacy Policy and other referenced agreements, constitutes the complete understanding between you and the platform regarding these critical areas of our service.
                </p>
              </div>
            </div>

            <div className="p-8 border-t border-white/10 bg-[#0a0a0a]/50 backdrop-blur-xl">
              <button
                onClick={onClose}
                className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-[0.3em] hover:bg-blue-700 transition-all active:scale-95"
              >
                Acknowledge & Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
