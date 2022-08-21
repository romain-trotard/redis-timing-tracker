import { Stat, StatHelpText, StatLabel, StatNumber } from "@chakra-ui/react";
import useCopyToClipboard from "../utils/hooks/useCopyToClipboard";

export default function Card({ label, value, ellipseValue = false, copyable = false }: { label: string; value: string | number; ellipseValue?: boolean; copyable?: boolean; }) {
    const copyToClipboard = useCopyToClipboard();

    return (<Stat h="100%" w="100%" borderWidth="1px" borderRadius="lg" padding={5} boxShadow="base">
        <StatLabel as="h3" textAlign="center">{label}</StatLabel>
        <StatNumber textAlign="center" {...(ellipseValue && { overflow: "hidden", textOverflow: "ellipsis" })}>{value}</StatNumber>
        {copyable && <StatHelpText textAlign="center" cursor="pointer" onClick={() => copyToClipboard(value.toString())}>Copy to clipboard</StatHelpText>}
    </Stat>);
}

