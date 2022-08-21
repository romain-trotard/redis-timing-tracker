import { Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay, Flex, Hide, IconButton, Link, Show, Text, useDisclosure, VStack } from "@chakra-ui/react";
import { ReactNode, useRef } from "react";
import NextLink from 'next/link';
import { useRouter } from "next/router";
import { HamburgerIcon } from "@chakra-ui/icons";

const TITLE = 'Timing tracker';

function NavTitle() {
    return (
        <Text fontSize="2xl" width="100%" paddingX={3} paddingY={5} textAlign="center" borderBottom="1px" borderColor="#e5e5e5">{TITLE}</Text>
    );
}

function NavItem({ children, href, onClick }: { children: ReactNode; href: string; onClick?: () => void }) {
    const router = useRouter();

    const isActive = router.pathname === href;

    return (
        <NextLink href={href} passHref>
            <Link marginBottom={1}
                onClick={onClick}
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

function DesktopNavigation() {
    return (
        <VStack as="nav" borderEnd="1px" borderColor="#cfcfcf" width="250px">
            <NavTitle />
            <NavItem href="/">All test overview</NavItem>
            <NavItem href="/test">Timing by test</NavItem>
        </VStack>
    );
}

function MobileNavigation() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const btnRef = useRef<HTMLButtonElement | null>(null);

    return (
        <>
            <Flex justifyContent="space-between" paddingX={3} paddingY={2}>
                <Text fontSize="2xl" fontWeight={600}>{TITLE}</Text>
                <IconButton ref={btnRef} onClick={onOpen} aria-label="Open menu" icon={<HamburgerIcon />} />
            </Flex>
            <Drawer
                isOpen={isOpen}
                placement='right'
                onClose={onClose}
                finalFocusRef={btnRef}
                size="full"
            >
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>{TITLE}</DrawerHeader>

                    <DrawerBody>
                        <VStack as="nav">
                            <NavItem href="/" onClick={onClose}>All test overview</NavItem>
                            <NavItem href="/test" onClick={onClose}>Timing by test</NavItem>
                        </VStack>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    );
}

export default function Navigation() {
    return (
        <>
            <Show above="md">
                <DesktopNavigation />
            </Show>
            <Hide above="md">
                <MobileNavigation />
            </Hide>
        </>
    );
}

