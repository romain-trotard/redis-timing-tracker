import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { getDisplayDateTime } from "../utils/date";

export default function Chart({ data, width, height, onValueClick }: { width?: number; height?: number; data: { timestamp: number; value: number; }[]; onValueClick?: (startTimestamp: string) => void; }) {
    return (
        <LineChart data={data} margin={{ top: 50, left: 50 }} width={width} height={height} onClick={(point) => {
            const activeLabel = point?.activeLabel;

            if (activeLabel !== undefined) {
                onValueClick?.(activeLabel);
            }
        }}>
            <Tooltip labelFormatter={(value: number) => `Started : ${getDisplayDateTime(value)}`}
                formatter={(value: number) => [`${value}ms`, 'Duration:']} />
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" label="Started at" tickFormatter={() => ''} />
            <YAxis domain={['auto', 'auto']} label={{ value: 'Duration', angle: -90, position: 'insideLeft' }} />
            <Line dataKey="value" stroke="#ff7300" dot />
        </LineChart>
    )
}

