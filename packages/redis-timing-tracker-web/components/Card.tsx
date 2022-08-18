import { Box, Center, Flex, Heading, Text } from "@chakra-ui/react";
import { ReactNode } from "react";

export default function Card({ label, value }: { label: string; value: ReactNode; }) {
    return (<Box h="100%" w="100%" borderWidth="1px" borderRadius="lg" padding={5} boxShadow="base">
        <Center as={Flex} flexDirection="column" gap={3} justifyItems="center" h="100%">
            <Heading as="h3" textAlign="center">{label}</Heading>
            <Text fontSize="xl">{value}</Text>
        </Center>
    </Box>);
}

