import { Mail, MapPin, Phone } from 'lucide-react';

import { cn } from '../lib/utils';

export interface ContactInfoProps {
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  className?: string;
}

export function ContactInfo({ address, city, postalCode, phone, email, className }: ContactInfoProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-start gap-3">
        <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-600" />
        <div>
          <p className="font-medium">{address}</p>
          <p className="text-neutral-600">{postalCode} {city}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Phone className="h-5 w-5 flex-shrink-0 text-primary-600" />
        <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-primary-600 hover:underline">
          {phone}
        </a>
      </div>

      <div className="flex items-center gap-3">
        <Mail className="h-5 w-5 flex-shrink-0 text-primary-600" />
        <a href={`mailto:${email}`} className="hover:text-primary-600 hover:underline">
          {email}
        </a>
      </div>
    </div>
  );
}
