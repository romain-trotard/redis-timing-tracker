import type { NextPage } from 'next'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { Alert, AlertIcon, Box, Button, ButtonGroup, Center, Container, Flex, Grid, GridItem, Heading, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverFooter, PopoverHeader, PopoverTrigger, Tooltip, useToast } from '@chakra-ui/react'
import Card from '../components/Card'
import { ResponsiveContainer } from 'recharts'
import EmptyState from '../components/EmptyState'
import { useRef, useState } from 'react'
import { getDisplayDateTime } from '../utils/date'
import siteUrl from '../utils/siteUrl'
import { getHumanDurationValue } from '../utils/time'


const Chart = dynamic(() => import('../components/Chart'), { ssr: false })

type TimeSeriesEntry = {
    timestamp: number;
    value: number;
}

type LatestRunInfo = { startTimestamp: number; duration: number; numberOfTests: number; };

type Props = {
    fullTestData: TimeSeriesEntry[] | null;
    latestRunInfo: LatestRunInfo | null
    siteUrl: string;
};

const Home: NextPage<Props> = ({ fullTestData, latestRunInfo, siteUrl }) => {
    const [info, setInfo] = useState<{ startTimestamp: number; commitSha: string | null; duration: number; numberOfTests: number; }>();
    const [data, setData] = useState(fullTestData ?? []);
    const initialFocusRef = useRef<HTMLButtonElement | null>(null);
    const showToast = useToast();

    if (latestRunInfo === null || fullTestData === null) {
        return <EmptyState />
    }

    const getInfo = async (startTimestamp: string) => {
        const url = new URL(`${siteUrl}/api/test/full/info`)
        url.searchParams.append('startTimestamp', startTimestamp);

        const response = await fetch(url);
        const testInfo = await response.json();

        setInfo(testInfo);
    }

    const deleteValue = async (timestamp: number) => {
        const url = new URL(`${siteUrl}/api/test/full/timing`)
        url.searchParams.append('timestamp', timestamp.toString());

        try {
            await fetch(url, { method: 'DELETE' });

            showToast({ title: 'The value has been deleted', status: 'success' });
        } catch (e) {
            showToast({ title: 'Error when deleting the value', status: 'error' });
        }
    }

    return (
        <div>
            <Head>
                <title>Full tests run</title>
                <meta name="description" content="Track the duration of all tests." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Center as={Flex} flexDirection="column" gap={5} marginTop={5}>
                <Container maxW="container.lg" w="100%" as={Flex} flexDirection="column" gap={5} alignItems="center">
                    <Grid templateColumns={{ base: undefined, md: "repeat(3, 1fr)" }} gap={4} width="100%">
                        <GridItem w="100%">
                            <Card label="Last duration" value={latestRunInfo === null ? 'N/A' : getHumanDurationValue(latestRunInfo.duration)} />
                        </GridItem>
                        <GridItem w="100%" gap={4}>
                            <Card label="Number of tests" value={latestRunInfo === null ? 'N/A' : latestRunInfo.numberOfTests} />
                        </GridItem>
                        <GridItem w="100%" gap={4}>
                            <Card label="Average time by test" value={latestRunInfo === null ? 'N/A' : getHumanDurationValue(Number((latestRunInfo.duration / latestRunInfo.numberOfTests).toFixed(2)))} />
                        </GridItem>
                    </Grid>
                    <Box h="100%" w="100%" borderWidth="1px" borderRadius="lg" padding={5} boxShadow="base">
                        <Heading as="h2">Full tests timing</Heading>
                        <ResponsiveContainer height={300}>
                            <Chart data={data} onValueClick={startTimestamp => getInfo(startTimestamp)} />
                        </ResponsiveContainer>
                    </Box>
                    {info ? (
                        <Flex flexDirection="column" gap={4}>
                            <Grid templateColumns={{ base: undefined, md: "repeat(3, 1fr)" }} gap={4} width="100%" gridAutoFlow="row">
                                <GridItem w="100%">
                                    <Card label="Run at" value={getDisplayDateTime(info.startTimestamp)} />
                                </GridItem>
                                <GridItem w="100%" gap={4}>
                                    <Card label="Duration" value={getHumanDurationValue(info.duration)} />
                                </GridItem>
                                <GridItem w="100%" gap={4} whiteSpace="nowrap" overflow="hidden">
                                    <Card label="Commit" value={info.commitSha ?? 'N/A'} ellipseValue copyable />
                                </GridItem>
                                <GridItem w="100%" gap={4} whiteSpace="nowrap" overflow="hidden">
                                    <Card label="Number of tests" value={info.numberOfTests} />
                                </GridItem>
                            </Grid>
                            <Flex justifyContent="flex-end" flexWrap="wrap" gap={4}>
                                <Tooltip label="Delete temporarily the point to see better the graph">
                                    <Button variant="outline" colorScheme="red" onClick={() => {
                                        setData(data.filter(v => v.timestamp !== info.startTimestamp));
                                        setInfo(undefined);
                                    }}>Delete from current chart</Button>
                                </Tooltip>
                                <Popover initialFocusRef={initialFocusRef} placement="top" closeOnBlur>
                                    <PopoverTrigger>
                                        <Button colorScheme="red">Delete definitely the point</Button>
                                    </PopoverTrigger>
                                    <PopoverContent color='white' bg='blue.800' borderColor='blue.800'>
                                        <PopoverHeader pt={4} fontWeight='bold' border='0'>
                                            Delete the point forever
                                        </PopoverHeader>
                                        <PopoverArrow />
                                        <PopoverCloseButton />
                                        <PopoverBody>
                                            Do you really want to delete the data definitely?
                                        </PopoverBody>
                                        <PopoverFooter
                                            border='0'
                                            display='flex'
                                            alignItems='center'
                                            justifyContent='flex-end'
                                            pb={4}
                                        >
                                            <ButtonGroup size='sm'>
                                                <Button colorScheme='red' ref={initialFocusRef} onClick={async () => {
                                                    await deleteValue(info.startTimestamp);

                                                    setData(data.filter(v => v.timestamp !== info.startTimestamp));
                                                    setInfo(undefined);
                                                }}>
                                                    Delete
                                                </Button>
                                            </ButtonGroup>
                                        </PopoverFooter>
                                    </PopoverContent>
                                </Popover>
                            </Flex>
                        </Flex>
                    ) : (
                        <Alert status="info">
                            <AlertIcon />
                            Click on a run to see more info
                        </Alert>)
                    }
                </Container>
            </Center>
        </div>
    )
}

export async function getServerSideProps() {
    const testUrl = new URL(`${siteUrl}/api/testsNames`)
    testUrl.searchParams.append('search', '')

    const fullTestResponse = await fetch(`${siteUrl}/api/test/full/timing`);
    const fullTestData = await fullTestResponse.json();

    // If no data from thid call, I know that I don't need to fetch anything else
    if (fullTestData === null) {
        return {
            props: {
                fullTestData: null,
                latestRunInfo: null,
            }
        };
    }


    const latestRunResponse = await fetch(`${siteUrl}/api/test/full/latestRunInfo`);
    const latestRunInfo = await latestRunResponse.json();

    return {
        props: {
            fullTestData,
            latestRunInfo,
            // Pass siteUrl not to have pb with env variable
            // Could be done with the PUBLIC env variable but it's easier like this
            siteUrl,
        }
    }
}

export default Home
