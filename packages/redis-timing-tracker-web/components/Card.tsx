import { Stat, StatLabel, StatNumber } from "@chakra-ui/react";
import { ReactNode } from "react";

export default function Card({ label, value, ellipseValue = false }: { label: string; value: ReactNode; ellipseValue?: boolean; }) {
    return (<Stat h="100%" w="100%" borderWidth="1px" borderRadius="lg" padding={5} boxShadow="base">
            <StatLabel as="h3" textAlign="center">{label}</StatLabel>
            <StatNumber textAlign="center" {...(ellipseValue && { overflow:"hidden", textOverflow:"ellipsis" })}>{value}</StatNumber>
    </Stat>);
}

