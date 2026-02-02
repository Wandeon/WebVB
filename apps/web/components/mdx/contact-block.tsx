'use client';

import { FadeIn } from '@repo/ui';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';

export interface ContactBlockProps {
  showMap?: boolean;
}

export function ContactBlock({ showMap = false }: ContactBlockProps) {
  return (
    <FadeIn>
      <div className="my-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
          <h3 className="font-display text-lg font-semibold text-white">
            Kontaktirajte nas
          </h3>
        </div>
        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium text-neutral-900">Adresa</div>
                <div className="text-sm text-neutral-600">
                  Dravska 7, Veliki Bukovec<br />
                  42231 Mali Bukovec
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium text-neutral-900">Telefon</div>
                <a
                  href="tel:+38542840040"
                  className="text-sm text-primary-600 hover:underline"
                >
                  042 840 040
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium text-neutral-900">Email</div>
                <a
                  href="mailto:opcinavk@gmail.com"
                  className="text-sm text-primary-600 hover:underline"
                >
                  opcinavk@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium text-neutral-900">Radno vrijeme</div>
                <div className="text-sm text-neutral-600">
                  Ponedjeljak - Petak<br />
                  07:00 - 15:00
                </div>
              </div>
            </div>
          </div>

          {showMap && (
            <div className="relative aspect-video overflow-hidden rounded-lg bg-neutral-100 md:aspect-auto md:h-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2775.854!2d16.844!3d46.321!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDbCsDE5JzE2LjAiTiAxNsKwNTAnMzcuNiJF!5e0!3m2!1sen!2shr!4v1600000000000!5m2!1sen!2shr"
                className="absolute inset-0 h-full w-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokacija Općine Veliki Bukovec"
              />
            </div>
          )}
        </div>
      </div>
    </FadeIn>
  );
}
