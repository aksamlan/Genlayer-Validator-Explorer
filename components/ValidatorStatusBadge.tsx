import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getValidatorStatus, VALIDATOR_STATUS_LABEL, type ValidatorInfo, type ValidatorStatus } from '@/types/validator';

const STATUS_CLASS: Record<ValidatorStatus, string> = {
    active: 'bg-primary/15 text-primary border-primary/30',
    pending: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    quarantined: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    banned: 'bg-destructive/20 text-destructive border-destructive/30',
    inactive: 'bg-muted text-muted-foreground',
};

export function ValidatorStatusBadge({ validator, className }: { validator: ValidatorInfo; className?: string }) {
    const status = getValidatorStatus(validator);
    return (
        <Badge className={cn('text-[9px] tracking-widest font-black', STATUS_CLASS[status], className)}>
            {VALIDATOR_STATUS_LABEL[status].toUpperCase()}
        </Badge>
    );
}
