import { CheckCircle2 } from 'lucide-react';

export function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${
      met ? 'text-green-600 dark:text-green-400 font-medium' : 'text-muted-foreground'
    }`}>
      <CheckCircle2 className={`h-3 w-3 ${met ? 'opacity-100' : 'opacity-30'}`} />
      <span>{text}</span>
    </div>
  );
}