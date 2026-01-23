import { APP_NAME } from '@repo/shared';
import { Button } from '@repo/ui';

export default function AdminHomePage() {
  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>{APP_NAME} - Admin</h1>
      <p>Administratorsko sučelje. Prijava će biti dodana u Sprint 0.3.</p>
      <Button variant="primary">Test Admin Button</Button>
    </main>
  );
}
