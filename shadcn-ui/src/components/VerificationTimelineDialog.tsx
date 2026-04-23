import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Mail, Clock } from 'lucide-react';
import { VERIFICATION_TIMELINE_SUMMARY, VERIFICATION_HOURS_RANGE } from '@/lib/verificationMessaging';

type Context = 'signup' | 'ghana_card_submitted';

const titles: Record<Context, string> = {
  signup: 'Account created — verification pending',
  ghana_card_submitted: 'Ghana Card details received'
};

interface VerificationTimelineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: Context;
}

export function VerificationTimelineDialog({ open, onOpenChange, context }: VerificationTimelineDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-foreground text-left">
            <Clock className="h-5 w-5 text-primary shrink-0" />
            {titles[context]}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4 text-left text-foreground/90 pt-2">
              <p className="text-sm leading-relaxed">{VERIFICATION_TIMELINE_SUMMARY}</p>
              <div className="flex gap-2 rounded-lg border border-border bg-muted/40 p-3 text-sm">
                <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  Watch your inbox (and spam folder) for messages from SmartLand and Ghana Lands Commission. Allow{' '}
                  <strong>{VERIFICATION_HOURS_RANGE}</strong> for a first response.
                </span>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction className="w-full sm:w-auto">I understand</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
