import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider, Flex } from '@chakra-ui/react';
import Navigation from '../components/Navigation';

function MyApp({ Component, pageProps }: AppProps) {
    return (<ChakraProvider>
        <Flex>
            <Navigation />
            <main style={{ flex: 1 }}><Component {...pageProps} /></main>
        </Flex>
    </ChakraProvider>)
}

export default MyApp
