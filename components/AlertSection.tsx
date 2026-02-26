"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ValidatorInfo } from "@/types/validator";
import { AlertTriangle } from "lucide-react";

interface AlertSectionProps {
    validators: ValidatorInfo[];
}

export function AlertSection({ validators }: AlertSectionProps) {
    const bannedValidators = validators.filter(v => v.isBanned);
    const inactiveValidators = validators.filter(v => !v.isActive && !v.isBanned);

    if (bannedValidators.length === 0 && inactiveValidators.length === 0) {
        return null;
    }

    return (
        <Card className="border-yellow-500/50">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <CardTitle>Validator Alerts</CardTitle>
                </div>
                <CardDescription>
                    Validators requiring attention
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {bannedValidators.length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold mb-2 text-destructive">
                            Banned Validators ({bannedValidators.length})
                        </h4>
                        <div className="space-y-2">
                            {bannedValidators.map((validator) => (
                                <div
                                    key={validator.address}
                                    className="flex items-center justify-between p-2 rounded-md bg-destructive/10 border border-destructive/20"
                                >
                                    <div>
                                        <div className="font-medium">{validator.moniker}</div>
                                        <code className="text-xs text-muted-foreground">{validator.address}</code>
                                    </div>
                                    <Badge variant="destructive">Banned</Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {inactiveValidators.length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold mb-2 text-yellow-500">
                            Inactive Validators ({inactiveValidators.length})
                        </h4>
                        <div className="space-y-2">
                            {inactiveValidators.map((validator) => (
                                <div
                                    key={validator.address}
                                    className="flex items-center justify-between p-2 rounded-md bg-yellow-500/10 border border-yellow-500/20"
                                >
                                    <div>
                                        <div className="font-medium">{validator.moniker}</div>
                                        <code className="text-xs text-muted-foreground">{validator.address}</code>
                                    </div>
                                    <Badge variant="warning">Inactive</Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                        💡 <strong>Webhook Integration:</strong> Configure Slack/Discord webhooks in environment variables to receive real-time alerts.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
