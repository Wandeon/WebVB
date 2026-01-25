import { Toaster } from '@repo/ui';

import { Breadcrumbs } from '@/components/layout';
import {
  PasswordForm,
  ProfileForm,
  SessionsList,
  TwoFactorSetup,
} from '@/components/settings';

export const metadata = {
  title: 'Postavke | Admin',
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900 lg:text-3xl">
          Postavke
        </h1>
        <Breadcrumbs items={[{ label: 'Postavke' }]} className="mt-1" />
      </div>

      {/* Profile Section */}
      <section aria-labelledby="profile-heading">
        <h2 id="profile-heading" className="sr-only">
          Profil
        </h2>
        <ProfileForm />
      </section>

      {/* Security Section */}
      <section aria-labelledby="security-heading" className="space-y-6">
        <h2 id="security-heading" className="text-lg font-semibold text-neutral-900">
          Sigurnost
        </h2>
        <PasswordForm />
        <TwoFactorSetup />
      </section>

      {/* Sessions Section */}
      <section aria-labelledby="sessions-heading">
        <h2 id="sessions-heading" className="sr-only">
          Sesije
        </h2>
        <SessionsList />
      </section>

      <Toaster />
    </div>
  );
}
