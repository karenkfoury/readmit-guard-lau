import { motion } from 'framer-motion';
import { User, Phone, Mail, MapPin } from 'lucide-react';
import type { Patient } from '@/types';

interface ContactCardProps {
  patient: Patient;
}

export function ContactCard({ patient }: ContactCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-lau-border bg-card p-5 shadow-sm mb-6"
    >
      <h3 className="font-heading font-semibold text-lau-anthracite mb-3 flex items-center gap-2">
        <User className="h-4 w-4 text-primary" /> Contact Information
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {patient.phone && (
          <a
            href={`tel:${patient.phone}`}
            className="flex items-center gap-2 text-sm font-body text-primary hover:underline"
          >
            <Phone className="h-4 w-4" strokeWidth={1.75} /> {patient.phone}
          </a>
        )}
        {patient.email && (
          <a
            href={`mailto:${patient.email}`}
            className="flex items-center gap-2 text-sm font-body text-primary hover:underline"
          >
            <Mail className="h-4 w-4" strokeWidth={1.75} /> {patient.email}
          </a>
        )}
        <div className="flex items-center gap-2 text-sm font-body text-muted-foreground">
          <MapPin className="h-4 w-4" strokeWidth={1.75} />
          {patient.livesAlone ? 'Lives alone' : 'Lives with family/support'}
        </div>
      </div>
    </motion.div>
  );
}
