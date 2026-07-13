import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="July 13, 2026">
      <p>
        This policy explains what personal data {site.name} collects, why we
        collect it, and how we protect it.
      </p>

      <h2>1. What we collect</h2>
      <ul>
        <li>
          <strong>Account data:</strong> your name, email address, and profile
          photo (if you sign in with Google).
        </li>
        <li>
          <strong>Purchase data:</strong> which courses you bought, the amount
          paid, and the Stripe transaction reference. Card numbers are handled
          entirely by Stripe and never reach our servers.
        </li>
        <li>
          <strong>Technical data:</strong> authentication tokens and the
          minimal cookies needed to keep you signed in.
        </li>
      </ul>

      <h2>2. Why we collect it</h2>
      <ul>
        <li>Name: personalizing your account and communications.</li>
        <li>Email: sign-in, purchase receipts, and account notifications.</li>
        <li>Purchase history: to unlock your course library and handle refunds.</li>
      </ul>

      <h2>3. What we never do</h2>
      <ul>
        <li>We never sell or rent your personal data.</li>
        <li>We never share your account data with third parties, except where the law requires it.</li>
        <li>We do not run third-party advertising or tracking networks on this site.</li>
      </ul>

      <h2>4. Third-party processors</h2>
      <p>
        We rely on two processors, both bound by their own strong privacy
        commitments: <strong>Google Firebase</strong> (authentication, database,
        and file storage) and <strong>Stripe</strong> (payment processing).
        Payment card data is collected and processed by Stripe under PCI-DSS
        compliance.
      </p>

      <h2>5. Data retention</h2>
      <p>
        Account data is kept while your account is active. Purchase records are
        retained as required for accounting and tax purposes. You may request
        deletion of your account at any time; we will remove personal data not
        legally required to be retained.
      </p>

      <h2>6. Security</h2>
      <p>
        Data is stored in Google Firebase with access controls that restrict
        each user to their own records. Course files are served only through
        short-lived signed links issued after ownership checks. Administrative
        access is limited to authorised staff.
      </p>

      <h2>7. Your rights</h2>
      <p>
        You may request a copy of the personal data we hold about you, ask us
        to correct it, or ask us to delete it, by emailing{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>. We respond within 30
        days.
      </p>

      <h2>8. Contact</h2>
      <p>
        Data controller: {site.name}, {site.address}. Email:{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
    </LegalPage>
  );
}
