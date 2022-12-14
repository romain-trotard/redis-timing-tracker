import type { NextPage } from 'next'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, Button, Center, Container, Flex, Grid, GridItem, Heading, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverFooter, PopoverHeader, PopoverTrigger, Portal, Text, Tooltip, useToast } from '@chakra-ui/react'
import { AsyncSelect, SingleValue } from 'chakra-react-select'
import { useRef, useState } from 'react'
import { ResponsiveContainer } from 'recharts'
import Card from '../../components/Card'
import { getDisplayDateTime } from '../../utils/date'
import EmptyState from '../../components/EmptyState'
import siteUrl from '../../utils/siteUrl'
import { getHumanDurationValue } from '../../utils/time'


const Chart = dynamic(() => import('../../components/Chart'), { ssr: false })

type TimeSeriesEntry = {
    timestamp: number;
    value: number;
}

type Props = {
    data: TimeSeriesEntry[] | null;
    initValue: { value: string; label: string; } | null;
    siteUrl: string;
    latestRunTimestamp: number;
};

const ByTestPage: NextPage<Props> = ({ data, initValue, siteUrl, latestRunTimestamp }) => {
    if (data === null || initValue === null) {
        return <EmptyState />
    }

    return <Content data={data} initValue={initValue} siteUrl={siteUrl} latestRunTimestamp={latestRunTimestamp} />
}

const Content: NextPage<{ data: TimeSeriesEntry[]; initValue: { value: string; label: string; }; siteUrl: string; latestRunTimestamp: number; }> = ({ data, initValue, siteUrl, latestRunTimestamp }) => {
    const [chartData, setChartData] = useState(data);
    const [value, setValue] = useState<SingleValue<{ value: string; label: string; }>>(initValue);
    const [info, setInfo] = useState<{ startTimestamp: number; commitSha: string | null; duration: number; }>();
    const initialFocusRef = useRef<HTMLButtonElement | null>(null);
    const [asyncSelectKey, forceAsyncSelectRerender] = useState(0);
    const [canBeDeleted, setCanBeDeleted] = useState(() => {
        return latestRunTimestamp > (chartData.at(-1)?.timestamp ?? 0)
    });
    const showToast = useToast();

    const fetchTimings = async (testName: string): Promise<{ timestamp: number; value: number; }[]> => {
        const url = new URL(`${siteUrl}/api/timings`)
        url.searchParams.append('testName', testName);

        const response = await fetch(url)
        return await response.json()
    }

    const getInfo = async (startTimestamp: string) => {
        if (value == null) {
            return;
        }

        const url = new URL(`${siteUrl}/api/test/single/info`)
        url.searchParams.append('testName', value.value);
        url.searchParams.append('startTimestamp', startTimestamp);

        const response = await fetch(url);
        const testInfo = await response.json();

        setInfo(testInfo);
    }

    const deleteValue = async (timestamp: number) => {
        if (value == null) {
            return;
        }

        const url = new URL(`${siteUrl}/api/timings`)
        url.searchParams.append('timestamp', timestamp.toString());
        url.searchParams.append('testName', value.value);

        try {
            await fetch(url, { method: 'DELETE' });

            showToast({ title: 'The value has been deleted', status: 'success' });
        } catch (e) {
            showToast({ title: 'Error when deleting the value', status: 'error' });
        }
    }

    const deleteTest = async () => {
        if (value == null) {
            return;
        }

        const url = new URL(`${siteUrl}/api/test`)
        url.searchParams.append('testName', value.value);

        try {
            await fetch(url, { method: 'DELETE' });

            // Remove the test from the array and select the next one
            setValue(null);
            // Trick to refresh the list of options... Sorry :(
            forceAsyncSelectRerender(prev => prev + 1);
            showToast({ title: 'The value has been deleted', status: 'success' });
        } catch (e) {
            showToast({ title: 'Error when deleting the value', status: 'error' });
        }

    }
    // console.log('data', { tuut: char.at(-1)?.timestamp, latestRunTimestamp, result: latestRunTimestamp > (data.at(-1)?.timestamp ?? 0) });

    return (
        <div>
            <Head>
                <title>Single test run</title>
                <meta name="description" content="Track the duration of all tests." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <Center as={Flex} flexDirection="column" gap={5} marginTop={5}>
                    <Container maxW="container.lg" w="100%" as={Flex} flexDirection="column" gap={5} alignItems="center">
                        <Box width="100%">
                            <Text as="label" fontSize="xl" fontWeight={700}>Test name</Text>
                            <AsyncSelect
                                key={asyncSelectKey}
                                placeholder="Select a test"
                                value={value}
                                onChange={v => {
                                    if (v !== null) {
                                        setValue(v);
                                        if (v?.value) {
                                            fetchTimings(v?.value).then(chartData => {
                                                setChartData(chartData);
                                                setCanBeDeleted(latestRunTimestamp > (chartData.at(-1)?.timestamp ?? 0));
                                            });
                                        }
                                    }
                                }}
                                defaultOptions
                                loadOptions={(inputValue, callback) => {
                                    const url = new URL(`${siteUrl}/api/testsNames`)
                                    url.searchParams.append('search', inputValue)

                                    fetch(url).then(response => {
                                        response.json().then(testsNames => {
                                            callback(testsNames.map((value: string) => ({ value: value, label: value })));
                                        })
                                    });
                                }}
                                chakraStyles={{ container: (provided) => ({ ...provided, width: '100%' }) }}
                            />
                        </Box>
                        {value ? (
                            <>
                                <Box h="100%" w="100%" borderWidth="1px" borderRadius="lg" padding={5} boxShadow="base">
                                    <Heading as="h2">{value?.label ?? 'Select a test'}</Heading>
                                    <ResponsiveContainer height={300}>
                                        <Chart data={chartData} onValueClick={startTimestamp => getInfo(startTimestamp)} />
                                    </ResponsiveContainer>
                                </Box>
                                {canBeDeleted ?
                                    (<Alert status="warning">
                                        <AlertIcon />
                                        <Box>
                                            <AlertTitle>Not existing anymore?</AlertTitle>
                                            <AlertDescription>
                                                The test seems to have been delete from your test suites. Because did not run in the last test execution. <br />
                                                Do you want to remove it?<br />
                                                <Popover initialFocusRef={initialFocusRef} placement="top" closeOnBlur>
                                                    <PopoverTrigger>
                                                        <Button size="sm" colorScheme="red" variant="solid" marginTop={2}>Remove the test</Button>
                                                    </PopoverTrigger>
                                                    <Portal>
                                                        <PopoverContent color='white' bg='blue.800' borderColor='blue.800'>
                                                            <PopoverHeader pt={4} fontWeight='bold' border='0'>
                                                                Are you sure?
                                                            </PopoverHeader>
                                                            <PopoverArrow />
                                                            <PopoverCloseButton />
                                                            <PopoverBody>
                                                                This action is irreversible and can't be undone.
                                                            </PopoverBody>
                                                            <PopoverFooter
                                                                border='0'
                                                                display='flex'
                                                                alignItems='center'
                                                                justifyContent='flex-end'
                                                                pb={4}
                                                            >
                                                                <Button size="sm" colorScheme='red' ref={initialFocusRef} onClick={deleteTest}>
                                                                    Delete
                                                                </Button>
                                                            </PopoverFooter>
                                                        </PopoverContent>
                                                    </Portal>
                                                </Popover>
                                            </AlertDescription>
                                        </Box>
                                    </Alert>) : undefined}
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
                                        </Grid>
                                        <Flex justifyContent="flex-end" flexWrap="wrap" gap={4}>
                                            <Tooltip label="Delete temporarily the point to see better the graph">
                                                <Button variant="outline" colorScheme="red" onClick={() => {
                                                    setChartData(chartData.filter(v => v.timestamp !== info.startTimestamp));
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
                                                        <Button size="sm" colorScheme='red' ref={initialFocusRef} onClick={async () => {
                                                            await deleteValue(info.startTimestamp);

                                                            setChartData(chartData.filter(v => v.timestamp !== info.startTimestamp));
                                                            setInfo(undefined);
                                                        }}>
                                                            Delete
                                                        </Button>
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
                            </>) : undefined}
                    </Container>
                </Center>
            </main>
        </div >
    )
}

type LatestRunInfo = { startTimestamp: number; duration: number; numberOfTests: number; };

export async function getServerSideProps() {
    const testUrl = new URL(`${siteUrl}/api/testsNames`)
    testUrl.searchParams.append('search', '')

    const testsResponse = await fetch(testUrl);
    const testsNames = await testsResponse.json();

    if (testsNames.length === 0) {
        return {
            props: {
                data: null,
                initValue: null,
            }
        }
    }

    const fetchTimings = async (testName: string) => {
        const url = new URL(`${siteUrl}/api/timings`)
        url.searchParams.append('testName', testName);
        return await fetch(url)
    }

    const firstTestName = testsNames[0];
    const response = await fetchTimings(firstTestName);
    const data = await response.json()

    const initValue = { value: firstTestName, label: firstTestName };

    // Latest run info to know if a test has been deleted
    const latestRunResponse = await fetch(`${siteUrl}/api/test/full/latestRunInfo`);
    const latestRunInfo: LatestRunInfo = await latestRunResponse.json();


    return {
        props: {
            data,
            initValue,
            // Pass siteUrl not to have pb with env variable
            // Could be done with the PUBLIC env variable but it's easier like this
            siteUrl,
            latestRunTimestamp: latestRunInfo.startTimestamp
        }
    }
}

export default ByTestPage;
