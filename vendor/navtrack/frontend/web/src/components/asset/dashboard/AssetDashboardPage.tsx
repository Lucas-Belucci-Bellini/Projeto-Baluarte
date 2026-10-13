import { AssetStatsPeriod } from "@navtrack/shared/api/model";
import { AssetDashboardRow } from "./AssetDashboardRow";

const periods = [
  { period: AssetStatsPeriod.Day, labelId: "generic.today" },
  { period: AssetStatsPeriod.Week, labelId: "generic.this-week" },
  { period: AssetStatsPeriod.Month, labelId: "generic.this-month" },
  { period: AssetStatsPeriod.Year, labelId: "generic.this-year" }
];

export function AssetDashboardPage() {
  return (
    <>
      {periods.map((item) => (
        <AssetDashboardRow
          key={item.labelId}
          period={item.period}
          labelId={item.labelId}
        />
      ))}
    </>
  );
}
