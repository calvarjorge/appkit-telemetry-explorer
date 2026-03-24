import { Input, Label } from '@databricks/appkit-ui/react';

export function DateRangeFilter({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
}: {
  startDate: string;
  endDate: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Label className="text-xs text-muted-foreground">From</Label>
      <Input
        type="date"
        className="h-8 w-36 text-xs"
        value={startDate}
        onChange={(e) => onStartChange(e.target.value)}
      />
      <Label className="text-xs text-muted-foreground">To</Label>
      <Input
        type="date"
        className="h-8 w-36 text-xs"
        value={endDate}
        onChange={(e) => onEndChange(e.target.value)}
      />
    </div>
  );
}
