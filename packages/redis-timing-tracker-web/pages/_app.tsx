import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider, Flex } from '@chakra-ui/react';
import Navigation from '../components/Navigation';

function MyApp({ Component, pageProps }: AppProps) {
    return (<ChakraProvider>
        <Flex flexDirection={{
            base: 'column',
            md: 'row',
        }}
            height="100%">
            <Navigation />
            <main style={{ flex: 1, paddingBottom: '15px' }}><Component {...pageProps} /></main>
        </Flex>
    </ChakraProvider>)
}

export default MyApp
