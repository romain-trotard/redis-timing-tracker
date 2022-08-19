import { Link, Text, VStack } from "@chakra-ui/react";
import { ReactNode } from "react";
import NextLink from 'next/link';
import { useRouter } from "next/router";

function NavTitle() {
    return (
        <Text fontSize="2xl" width="100%" paddingX={3} paddingY={5} textAlign="center" borderBottom="1px" borderColor="#e5e5e5">Timing tracker</Text>
    );
}

function NavItem({ children, href }: { children: ReactNode; href: string; }) {
    const router = useRouter();

    const isActive = router.pathname === href;

    return (
        <NextLink href={href} passHref>
            <Link marginBottom={1}
                paddingX={3}
                paddingY={2}
                width="100%"
                textAlign="center"
                borderRadius="lg"
                backgroundColor={isActive ? '#ffa446' : undefined}
                _hover={{
                    backgroundColor: isActive ? undefined : '#ffe7b1',
                }}>{children}</Link>
        </NextLink>
    );
}

export default function Navigation() {
    return (
        <VStack as="nav" borderEnd="1px" borderColor="#cfcfcf" width="250px">
            <NavTitle />
            <NavItem href="/">All test overview</NavItem>
            <NavItem href="/test">Timing by test</NavItem>
        </VStack>
    );
}

