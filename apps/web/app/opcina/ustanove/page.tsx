// apps/web/app/opcina/ustanove/page.tsx
// Redirect legacy route to new standalone /skola page
import { redirect } from 'next/navigation';

export default function OldUstanovePage() {
  redirect('/skola');
}
