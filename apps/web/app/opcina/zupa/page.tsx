// apps/web/app/opcina/zupa/page.tsx
// Redirect legacy route to new standalone /zupa page
import { redirect } from 'next/navigation';

export default function OldZupaPage() {
  redirect('/zupa');
}
