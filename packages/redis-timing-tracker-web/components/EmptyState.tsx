import { Box, Center, Container, Flex, Text } from "@chakra-ui/react";

export default function EmptyState() {
        return (
            <Center as={Flex} flexDirection="column" gap={5} marginTop={5}>
                <Container maxW="container.lg" w="100%" as={Flex} flexDirection="column" gap={5} alignItems="center">
                    <Box h="100%" w="100%" borderWidth="1px" borderRadius="lg" padding={5} boxShadow="base">
                        <Text fontSize="2xl" fontWeight={600}>No data</Text>
                        <p>You don't have any run yet, go launch your test for the first time and you will see the data here :)</p>
                    </Box>
                </Container>
            </Center>
        );
}

