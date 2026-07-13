import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions" updated="July 13, 2026">
      <p>
        These Terms and Conditions (&ldquo;Terms&rdquo;) govern your use of the
        website operated by {site.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;,
        &ldquo;our&rdquo;) and the purchase of digital educational products
        offered on it. By creating an account or making a purchase, you agree
        to these Terms.
      </p>

      <h2>1. What we sell</h2>
      <p>
        {site.name} sells digital educational material (downloadable and
        online-readable PDF courses) about poker strategy, game theory, and
        related study skills. We are an education provider only. We do not
        operate games of chance, host or facilitate gambling, accept or place
        wagers, or handle gambling funds of any kind.
      </p>

      <h2>2. Eligibility and accounts</h2>
      <ul>
        <li>You must be at least 18 years old to create an account or purchase our products.</li>
        <li>You must provide accurate information when registering, including your full name and email address.</li>
        <li>New accounts are reviewed by our team. Purchasing is enabled only after your account is approved.</li>
        <li>You are responsible for keeping your login credentials secure. Accounts are personal and may not be shared.</li>
      </ul>

      <h2>3. Purchases and delivery</h2>
      <ul>
        <li>All prices are shown in US Dollars (USD) and charged at checkout via Stripe, our payment processor. We never see or store your card details.</li>
        <li>Delivery is instant and digital: once payment is confirmed, the purchased course appears in your account library, where you can read it online or download the PDF.</li>
        <li>A purchase grants you a personal, non-exclusive, non-transferable licence to use the material for your own study.</li>
      </ul>

      <h2>4. Refunds</h2>
      <p>
        Purchases can be refunded within 14 days if the course material has not
        been accessed or downloaded. Full details are in our{" "}
        <Link href="/refunds">Refund Policy</Link>.
      </p>

      <h2>5. Intellectual property</h2>
      <p>
        All course material, branding, and website content are our intellectual
        property or licensed to us. You may not reproduce, resell, share,
        publish, or distribute purchased material. Doing so may result in
        account suspension without refund and legal action.
      </p>

      <h2>6. Acceptable use</h2>
      <ul>
        <li>Do not attempt to access material you have not purchased.</li>
        <li>Do not interfere with the operation or security of the website.</li>
        <li>Do not use the site under a false identity or someone else&rsquo;s account.</li>
      </ul>

      <h2>7. Responsible play disclaimer</h2>
      <p>
        Our material teaches strategy and discipline. Poker involves risk, and
        no educational product can guarantee winnings. Nothing on this site is
        financial advice. If gambling is affecting your life, seek help from a
        local support organisation and consider self-exclusion tools.
      </p>

      <h2>8. Suspension and termination</h2>
      <p>
        We may suspend or terminate accounts that violate these Terms, provide
        false registration details, initiate fraudulent chargebacks, or misuse
        purchased material. Lawful purchases already delivered remain governed
        by the Refund Policy.
      </p>

      <h2>9. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, our liability arising from your
        use of the site or products is limited to the amount you paid for the
        product concerned. We provide the website &ldquo;as is&rdquo; and do
        not guarantee uninterrupted availability.
      </p>

      <h2>10. Changes</h2>
      <p>
        We may update these Terms from time to time. The &ldquo;Last
        updated&rdquo; date above reflects the current version. Continued use
        of the site after changes constitutes acceptance.
      </p>

      <h2>11. Contact</h2>
      <p>
        {site.name}, {site.address}. Email:{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>. We aim to respond to
        all enquiries within one business day.
      </p>
    </LegalPage>
  );
}
