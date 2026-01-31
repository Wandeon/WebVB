// Redirect /udruge to /opcina/udruge
import { redirect } from 'next/navigation';

export default function UdrugePage() {
  redirect('/opcina/udruge');
}
