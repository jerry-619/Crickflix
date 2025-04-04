import { useState, useEffect } from 'react';
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  Grid,
  Text,
  Heading,
  Progress,
  Card,
  CardBody,
  Stack,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  Flex,
  Avatar,
  Divider,
  useColorModeValue,
  Button,
  HStack,
  UnorderedList,
  ListItem
} from '@chakra-ui/react';
import axios from 'axios';
import LiveScore from './LiveScore';

const PredictionTabs = ({ matchId }) => {
  const [predictions, setPredictions] = useState({
    match: null,
    toss: null
  });
  const [loading, setLoading] = useState({
    match: false,
    toss: false
  });
  const [error, setError] = useState({
    match: null,
    toss: null
  });
  const [selectedTab, setSelectedTab] = useState(0);

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    fetchPrediction('match');
    fetchPrediction('toss');
  }, [matchId]);

  const fetchPrediction = async (type) => {
    if (loading[type]) return;
    
    setLoading(prev => ({ ...prev, [type]: true }));
    setError(prev => ({ ...prev, [type]: null }));
    
    try {
      console.log(`Fetching ${type} prediction for match:`, matchId);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/predictions/${matchId}/${type}`);
      console.log(`${type} prediction response:`, response.data);
      
      // Validate that the response data has the expected structure
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response format');
      }
      
      setPredictions(prev => ({ ...prev, [type]: response.data }));
    } catch (err) {
      console.error(`${type} prediction error:`, err);
      const errorMessage = err.response?.data?.message || 
                         err.response?.data?.error || 
                         err.message || 
                         `Failed to load ${type} prediction`;
      setError(prev => ({ ...prev, [type]: errorMessage }));
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const retryPrediction = (type) => {
    setPredictions(prev => ({ ...prev, [type]: null }));
    setError(prev => ({ ...prev, [type]: null }));
    fetchPrediction(type);
  };

  const renderMatchPrediction = () => {
    if (loading.match) {
      return (
        <Flex justify="center" align="center" minH="200px">
          <Spinner size="xl" color="blue.500" thickness="4px" />
        </Flex>
      );
    }
    
    if (error.match) {
      return (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box flex="1">
            <Text>{error.match}</Text>
            <Button size="sm" onClick={() => retryPrediction('match')} mt={2}>
              Retry
            </Button>
          </Box>
        </Alert>
      );
    }
    
    if (!predictions.match) {
      return (
        <Flex justify="center" align="center" minH="200px">
          <Spinner size="xl" color="blue.500" thickness="4px" />
        </Flex>
      );
    }

    // Destructure with default values to prevent undefined errors
    const { 
      matchAnalysis = {
        conditions: {},
        winningProbability: { team1: '0', team2: '0' }
      },
      prediction = {
        winner: 'N/A',
        margin: 'N/A',
        confidence: 'N/A'
      },
      team1Stats = {
        recentForm: 'N/A',
        keyPlayers: []
      },
      team2Stats = {
        recentForm: 'N/A',
        keyPlayers: []
      },
      venue = {
        name: 'N/A',
        city: 'N/A',
        country: 'N/A',
        capacity: 'N/A',
        date: 'N/A',
        matchTime: 'N/A',
        description: 'N/A',
        knownFor: []
      }
    } = predictions.match || {};

    const team1Name = predictions.match?.team1?.name || predictions.match?.team1 || 'Team 1';
    const team2Name = predictions.match?.team2?.name || predictions.match?.team2 || 'Team 2';

    return (
      <Stack spacing={4}>
        {/* Venue and Win Probability */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stack spacing={4}>
              <Heading size="md">Match Details</Heading>
              <Box>
                <Heading size="sm" mb={2}>Venue Information</Heading>
                <Text mb={2}>Venue: {venue.name}</Text>
                <Text mb={2}>Location: {venue.city}, {venue.country}</Text>
                <Text mb={2}>Capacity: {venue.capacity}</Text>
                <Text mb={2}>Match Date: {venue.date}</Text>
                <Text mb={2}>Match Time: {venue.matchTime}</Text>
                <Text mb={4}>{venue.description}</Text>
                
                {venue.knownFor && venue.knownFor.length > 0 && (
                  <Box mb={4}>
                    <Text fontWeight="medium">Known For:</Text>
                    <UnorderedList>
                      {venue.knownFor.map((feature, index) => (
                        <ListItem key={index}>{feature}</ListItem>
                      ))}
                    </UnorderedList>
                  </Box>
                )}

                <Divider my={4} />

                <Text mb={2}>Conditions: {matchAnalysis.conditions.weather || 'N/A'}</Text>
                <Text mb={2}>Pitch: {matchAnalysis.conditions.pitch || 'N/A'}</Text>
                <Text mb={4}>Time: {matchAnalysis.conditions.time || 'N/A'}</Text>
                
                <Heading size="sm" mb={2}>Win Probability</Heading>
                <Text mb={2}>{team1Name}: {matchAnalysis.winningProbability.team1}%</Text>
                <Progress value={parseInt(matchAnalysis.winningProbability.team1) || 0} colorScheme="blue" mb={4} />
                <Text mb={2}>{team2Name}: {matchAnalysis.winningProbability.team2}%</Text>
                <Progress value={parseInt(matchAnalysis.winningProbability.team2) || 0} colorScheme="green" />
              </Box>
            </Stack>
          </CardBody>
        </Card>

        {/* Match Analysis */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stack spacing={4}>
              <Heading size="md">Match Analysis</Heading>
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                {/* Team 1 Stats */}
                <Box>
                  <Heading size="sm" mb={2}>{team1Name}</Heading>
                  <Text fontSize="sm" mb={2}>Recent Form: {team1Stats.recentForm}</Text>
                  <Text fontSize="sm" mb={2}>Key Players:</Text>
                  <UnorderedList>
                    {team1Stats.keyPlayers.map((player, index) => (
                      <ListItem key={index}>{player}</ListItem>
                    ))}
                  </UnorderedList>
                </Box>
                {/* Team 2 Stats */}
                <Box>
                  <Heading size="sm" mb={2}>{team2Name}</Heading>
                  <Text fontSize="sm" mb={2}>Recent Form: {team2Stats.recentForm}</Text>
                  <Text fontSize="sm" mb={2}>Key Players:</Text>
                  <UnorderedList>
                    {team2Stats.keyPlayers.map((player, index) => (
                      <ListItem key={index}>{player}</ListItem>
                    ))}
                  </UnorderedList>
                </Box>
              </Grid>
              <Divider />
              {/* Prediction */}
              <Box>
                <Heading size="sm" mb={2}>Prediction</Heading>
                <Text>Winner: <Badge colorScheme="green">{prediction.winner}</Badge></Text>
                <Text>Margin: {prediction.margin}</Text>
                <Text>Confidence: {prediction.confidence}</Text>
              </Box>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    );
  };

  const renderTossPrediction = () => {
    if (loading.toss) {
      return (
        <Flex justify="center" align="center" minH="200px">
          <Spinner size="xl" color="blue.500" thickness="4px" />
        </Flex>
      );
    }
    
    if (error.toss) {
      return (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box flex="1">
            <Text>{error.toss}</Text>
            <Button size="sm" onClick={() => retryPrediction('toss')} mt={2}>
              Retry
            </Button>
          </Box>
        </Alert>
      );
    }
    
    if (!predictions.toss) {
      return (
        <Flex justify="center" align="center" minH="200px">
          <Spinner size="xl" color="blue.500" thickness="4px" />
        </Flex>
      );
    }

    const { tossPrediction, conditions, historicalData } = predictions.toss;
    const venue = predictions.toss.matchVenue;
    const tossTeam1Name = predictions.toss.team1?.name || predictions.toss.team1 || 'Team 1';
    const tossTeam2Name = predictions.toss.team2?.name || predictions.toss.team2 || 'Team 2';

    return (
      <Stack spacing={4}>
        {/* Toss Prediction */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stack spacing={4}>
              <Heading size="md">Toss Prediction</Heading>
              <Box>
                <Heading size="sm" mb={2}>Venue Information</Heading>
                <Text mb={2}>Venue: {venue?.name || 'N/A'}</Text>
                <Text mb={2}>Location: {venue?.city}, {venue?.country}</Text>
                <Text mb={2}>Capacity: {venue?.capacity || 'N/A'}</Text>
                <Text mb={2}>Match Date: {venue?.date || 'N/A'}</Text>
                <Text mb={2}>Match Time: {venue?.matchTime || 'N/A'}</Text>
                <Text mb={4}>{venue?.description || 'N/A'}</Text>
                
                {venue?.knownFor && venue.knownFor.length > 0 && (
                  <Box mb={4}>
                    <Text fontWeight="medium">Known For:</Text>
                    <UnorderedList>
                      {venue.knownFor.map((feature, index) => (
                        <ListItem key={index}>{feature}</ListItem>
                      ))}
                    </UnorderedList>
                  </Box>
                )}

                <Divider my={4} />

                <Text fontSize="lg" mb={2}>
                  Likely winner: <Badge colorScheme="purple">{tossPrediction?.winner || 'N/A'}</Badge>
                </Text>
                <Text fontSize="lg" mb={2}>
                  Expected decision: <Badge colorScheme="orange">{tossPrediction?.choice || 'N/A'}</Badge>
                </Text>
                <Text fontSize="lg" mb={2}>
                  Confidence: {tossPrediction?.confidence || 'N/A'}
                </Text>
              </Box>
            </Stack>
          </CardBody>
        </Card>

        {/* Conditions and Historical Data */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stack spacing={4}>
              <Box>
                <Heading size="sm" mb={2}>Match Conditions</Heading>
                <Text mb={2}>Time: {conditions?.time || 'N/A'}</Text>
                <Text mb={2}>Weather: {conditions?.weather || 'N/A'}</Text>
                <Text mb={4}>Pitch: {conditions?.pitch || 'N/A'}</Text>
              </Box>

              <Divider />

              <Box>
                <Heading size="sm" mb={2}>Historical Data</Heading>
                <Text mb={2}>{tossTeam1Name} Toss Win Rate: {historicalData?.team1TossWinRate || 'N/A'}</Text>
                <Text mb={2}>{tossTeam2Name} Toss Win Rate: {historicalData?.team2TossWinRate || 'N/A'}</Text>
                <Text mb={2}>Venue Pattern: {historicalData?.venueTossPattern || 'N/A'}</Text>
                <Text mb={4}>Venue History: {historicalData?.venueHistory || 'N/A'}</Text>
              </Box>

              <Divider />

              <Box>
                <Heading size="sm" mb={2}>Reasoning</Heading>
                {tossPrediction?.reasoning && tossPrediction.reasoning.length > 0 ? (
                  <UnorderedList>
                    {tossPrediction.reasoning.map((reason, index) => (
                      <ListItem key={index}>{reason}</ListItem>
                    ))}
                  </UnorderedList>
                ) : (
                  <Text>No reasoning provided</Text>
                )}
              </Box>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    );
  };

  return (
    <Box>
      {/* Prediction Tabs */}
      <Tabs 
        variant="enclosed" 
        onChange={setSelectedTab} 
        defaultIndex={0}
        colorScheme="blue"
        width="100%"
      >
        <TabList display="flex" width="100%">
          <Tab flex="1" fontSize={{ base: "sm", md: "md" }} fontWeight="semibold">Live Score</Tab>
          <Tab flex="1" fontSize={{ base: "sm", md: "md" }} fontWeight="semibold">Match</Tab>
          <Tab flex="1" fontSize={{ base: "sm", md: "md" }} fontWeight="semibold">Toss</Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0} pt={4}>
            <LiveScore />
          </TabPanel>
          <TabPanel p={0} pt={4}>
            {renderMatchPrediction()}
          </TabPanel>
          <TabPanel p={0} pt={4}>
            {renderTossPrediction()}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default PredictionTabs; 