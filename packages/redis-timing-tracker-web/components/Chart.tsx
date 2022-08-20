import { DateTime } from "luxon";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

export default function Chart({ data, width, height, onValueClick }: { width?: number; height?: number; data: { timestamp: number; value: number; }[]; onValueClick?: (startedAt: string) => void; }) {
    return (
        <LineChart data={data} margin={{ top: 50, left: 50 }} width={width} height={height} onClick={({ activeLabel }) => {
            if (activeLabel !== undefined) {
                onValueClick?.(activeLabel);
            }
        }}>
            <Tooltip labelFormatter={(value: number) => `Started : ${DateTime.fromMillis(value).toISO()}`}
                formatter={(value: number) => [`${value}ms`, 'Duration:']} />
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" label="Started at" tickFormatter={() => ''} />
            <YAxis domain={['auto', 'auto']} label={{ value: 'Duration', angle: -90, position: 'insideLeft' }} />
            <Line dataKey="value" stroke="#ff7300" dot />
        </LineChart>
    )
}

