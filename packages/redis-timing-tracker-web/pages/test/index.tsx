import type { NextPage } from 'next'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { Box, Center, Container, Flex, Grid, GridItem, Heading, Text } from '@chakra-ui/react'
import { AsyncSelect, SingleValue } from 'chakra-react-select'
import { useState } from 'react'
import { ResponsiveContainer } from 'recharts'
import { start } from 'repl'
import Card from '../../components/Card'
import { DateTime } from 'luxon'
import { getDisplayDateTime } from '../../utils/date'


const Chart = dynamic(() => import('../../components/Chart'), { ssr: false })

type TimeSeriesEntry = {
    timestamp: number;
    value: number;
}

type Props = {
    data: TimeSeriesEntry[];
    initValue: { value: string; label: string; };
};

const ByTestPage: NextPage<Props> = ({ data, initValue }) => {
    const [chartData, setChartData] = useState(data);
    const [value, setValue] = useState<NonNullable<SingleValue<{ value: string; label: string; }>>>(initValue);
    const [info, setInfo] = useState<{ startedAt: number; commitSha: string | null; duration: number; }>();

    const fetchTimings = async (testName: string): Promise<{ timestamp: number; value: number; }[]> => {
        const url = new URL('http://localhost:3000/api/timings')
        url.searchParams.append('testName', testName);

        const response = await fetch(url)
        return await response.json()
    }

    const getInfo = async (startedAt: string) => {
        const url = new URL('http://localhost:3000/api/test/single/info')
        url.searchParams.append('testName', value.value);
        url.searchParams.append('startedAt', startedAt);

        const response = await fetch(url);
        const testInfo = await response.json();

        setInfo(testInfo);
    }

    return (
        <div>
            <Head>
                <title>Create Next App</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <Center as={Flex} flexDirection="column" gap={5} marginTop={5}>
                    <Container maxW="container.lg" w="100%" as={Flex} flexDirection="column" gap={5} alignItems="center">
                        <div>
                        <Text as="label" fontSize="xl" fontWeight={700}>Test name</Text>
                        <AsyncSelect placeholder="Select a test"
                            value={value}
                            onChange={v => {
                                if (v !== null) {
                                    setValue(v);
                                    if (v?.value) {
                                        fetchTimings(v?.value).then(setChartData);
                                    }
                                }
                            }}
                            defaultOptions
                            loadOptions={(inputValue, callback) => {
                                const url = new URL('http://localhost:3000/api/testsNames')
                                url.searchParams.append('search', inputValue)

                                fetch(url).then(response => {
                                    response.json().then(testsNames => {
                                        callback(testsNames.map((value: string) => ({ value: value, label: value })));
                                    })
                                });
                            }}
                            chakraStyles={{ container: (provided) => ({ ...provided, width: '500px' }) }}
                        />
                        </div>
                        <Box h="100%" w="100%" borderWidth="1px" borderRadius="lg" padding={5} boxShadow="base">
                            <Heading as="h2">{value?.label ?? 'Select a test'}</Heading>
                            <ResponsiveContainer height={300}>
                                <Chart data={chartData} onValueClick={startedAt => getInfo(startedAt)} />
                            </ResponsiveContainer>
                        </Box>
                        {info && (
                            <Grid templateColumns="repeat(3, 1fr)" gap={4} width="100%">
                                <GridItem w="100%" >
                                    <Card label="Run at" value={getDisplayDateTime(info.startedAt)} />
                                </GridItem>
                                <GridItem w="100%" gap={4}>
                                    <Card label="Duration" value={`${info.duration}ms`} />
                                </GridItem>
                                <GridItem w="100%" gap={4}>
                                    <Card label="Commit" value={info.commitSha ?? 'N/A'} />
                                </GridItem>
                            </Grid>
                        )}
                    </Container>
                </Center>
            </main>
        </div>
    )
}

export async function getStaticProps() {
    const testUrl = new URL('http://localhost:3000/api/testsNames')
    testUrl.searchParams.append('search', '')

    const testsResponse = await fetch(testUrl);
    const testsNames = await testsResponse.json();

    const fetchTimings = async (testName: string) => {
        const url = new URL('http://localhost:3000/api/timings')
        url.searchParams.append('testName', testName);
        return await fetch(url)
    }

    const firstTestName = testsNames[0];
    const response = await fetchTimings(firstTestName);
    const data = await response.json()

    const initValue = { value: firstTestName, label: firstTestName };


    return {
        props: {
            data,
            initValue,
        }
    }
}

export default ByTestPage;
