import { APP_NAME } from '@repo/shared';
import { Button } from '@repo/ui';

export default function HomePage() {
  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>{APP_NAME}</h1>
      <p>Dobrodošli na službenu web stranicu Općine Veliki Bukovec.</p>
      <Button variant="primary">Test Button</Button>
    </main>
  );
}
