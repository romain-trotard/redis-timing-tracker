import { DateTime } from "luxon";
import { CartesianGrid, Label, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

export default function Chart({ data, width, height }: { width?: number; height?: number; data: { timestamp: number; value: number; }[] }) {
    return (
        <LineChart data={data} margin={{ top: 50, left: 50 }} width={width} height={height}>
            <Tooltip labelFormatter={(value: number) => `Started : ${DateTime.fromMillis(value).toISO()}`}
                formatter={(value: number) => [`${value}ms`, 'Duration:']} />
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" label="Started at" tickFormatter={() => ''} />
            <YAxis domain={['auto', 'auto']} label={{ value: 'Duration', angle: -90, position: 'insideLeft' }} />
            <Line dataKey="value" stroke="#ff7300" dot />
        </LineChart>
    )
}

