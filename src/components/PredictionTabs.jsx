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

const PredictionTabs = ({ matchId }) => {
  const [predictions, setPredictions] = useState({
    fantasy: null,
    match: null,
    toss: null
  });
  const [loading, setLoading] = useState({
    fantasy: false,
    match: false,
    toss: false
  });
  const [error, setError] = useState({
    fantasy: null,
    match: null,
    toss: null
  });
  const [selectedTab, setSelectedTab] = useState(0);

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

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

  const renderFantasyXI = () => {
    if (loading.fantasy) {
      return (
        <Flex justify="center" align="center" minH="200px">
          <Spinner size="xl" color="blue.500" thickness="4px" />
        </Flex>
      );
    }
    
    if (error.fantasy) {
      return (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box flex="1">
            <Text>{error.fantasy}</Text>
            <Button size="sm" onClick={() => retryPrediction('fantasy')} mt={2}>
              Retry
            </Button>
          </Box>
        </Alert>
      );
    }
    
    if (!predictions.fantasy) {
      return (
        <Flex direction="column" align="center" justify="center" minH="200px">
          <Text mb={4}>Generate fantasy XI prediction for this match</Text>
          <Button
            colorScheme="blue"
            onClick={() => fetchPrediction('fantasy')}
            isLoading={loading.fantasy}
          >
            Generate Fantasy XI
          </Button>
        </Flex>
      );
    }

    return (
      <Stack spacing={6}>
        {/* Captain and Vice Captain Section */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
          {/* Captain Card */}
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stack spacing={3}>
                <Heading size="md" color="blue.500">Captain</Heading>
                <Flex align="center" gap={3}>
                  <Avatar name={predictions.fantasy.captain.name} size="lg" />
                  <Stack spacing={0}>
                    <Text fontWeight="bold">{predictions.fantasy.captain.name}</Text>
                    <Text fontSize="sm" color="gray.500">{predictions.fantasy.captain.role}</Text>
                    <Badge colorScheme={predictions.fantasy.captain.team === predictions.fantasy.team1 ? "blue" : "green"}>
                      {predictions.fantasy.captain.team}
                    </Badge>
                  </Stack>
                </Flex>
                <Box>
                  <Text fontSize="sm" fontWeight="medium">Current Form:</Text>
                  <Text fontSize="sm">{predictions.fantasy.captain.currentForm || 'N/A'}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="medium">Expected Points:</Text>
                  <Text fontSize="sm">{predictions.fantasy.captain.expectedPoints || '0'}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="medium">Selection Reason:</Text>
                  <Text fontSize="sm">{predictions.fantasy.captain.reason || 'N/A'}</Text>
                </Box>
              </Stack>
            </CardBody>
          </Card>

          {/* Vice Captain Card */}
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stack spacing={3}>
                <Heading size="md" color="purple.500">Vice Captain</Heading>
                <Flex align="center" gap={3}>
                  <Avatar name={predictions.fantasy.viceCaptain.name} size="lg" />
                  <Stack spacing={0}>
                    <Text fontWeight="bold">{predictions.fantasy.viceCaptain.name}</Text>
                    <Text fontSize="sm" color="gray.500">{predictions.fantasy.viceCaptain.role}</Text>
                    <Badge colorScheme={predictions.fantasy.viceCaptain.team === predictions.fantasy.team1 ? "blue" : "green"}>
                      {predictions.fantasy.viceCaptain.team}
                    </Badge>
                  </Stack>
                </Flex>
                <Box>
                  <Text fontSize="sm" fontWeight="medium">Current Form:</Text>
                  <Text fontSize="sm">{predictions.fantasy.viceCaptain.currentForm || 'N/A'}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="medium">Expected Points:</Text>
                  <Text fontSize="sm">{predictions.fantasy.viceCaptain.expectedPoints || '0'}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="medium">Selection Reason:</Text>
                  <Text fontSize="sm">{predictions.fantasy.viceCaptain.reason || 'N/A'}</Text>
                </Box>
              </Stack>
            </CardBody>
          </Card>
        </Grid>

        {/* Team Composition */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Heading size="md" mb={4}>Team Composition</Heading>
            <Grid templateColumns="repeat(4, 1fr)" gap={4}>
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">{predictions.fantasy.teamComposition.batsmen}</Text>
                <Text fontSize="sm">Batsmen</Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="green.500">{predictions.fantasy.teamComposition.bowlers}</Text>
                <Text fontSize="sm">Bowlers</Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="purple.500">{predictions.fantasy.teamComposition.allRounders}</Text>
                <Text fontSize="sm">All-Rounders</Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="orange.500">{predictions.fantasy.teamComposition.wicketKeeper}</Text>
                <Text fontSize="sm">Wicket-Keeper</Text>
              </Box>
            </Grid>
          </CardBody>
        </Card>

        {/* Players Grid */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
          {predictions.fantasy.players.map((player, index) => (
            <Card key={index} bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <CardBody>
                <Stack spacing={3}>
                  <Flex align="center" gap={3}>
                    <Avatar name={player.name} />
                    <Stack spacing={0} flex={1}>
                      <Flex justify="space-between" align="center">
                        <Text fontWeight="bold">{player.name}</Text>
                        <HStack spacing={2}>
                          {player.isCaptain && <Badge colorScheme="blue">C</Badge>}
                          {player.isViceCaptain && <Badge colorScheme="purple">VC</Badge>}
                        </HStack>
                      </Flex>
                      <Text fontSize="sm" color="gray.500">{player.role}</Text>
                      <Badge colorScheme={player.team === predictions.fantasy.team1 ? "blue" : "green"} width="fit-content">
                        {player.team}
                      </Badge>
                    </Stack>
                  </Flex>
                  <Divider />
                  <Grid templateColumns="repeat(2, 1fr)" gap={2} fontSize="sm">
                    <Box>
                      <Text fontWeight="medium">Recent Form:</Text>
                      <Text>{player.recentForm || 'N/A'}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="medium">Matches:</Text>
                      <Text>{player.matchesPlayed || '0'}</Text>
                    </Box>
                  </Grid>
                  <Box fontSize="sm">
                    <Text fontWeight="medium">Current Stats:</Text>
                    <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                      <Text>Runs: {(player.currentStats && player.currentStats.runs) || '0'}</Text>
                      <Text>Wickets: {(player.currentStats && player.currentStats.wickets) || '0'}</Text>
                      <Text>Avg: {(player.currentStats && player.currentStats.average) || '0'}</Text>
                      <Text>SR: {(player.currentStats && player.currentStats.strikeRate) || '0'}</Text>
                    </Grid>
                  </Box>
                  <Box fontSize="sm">
                    <Text fontWeight="medium">Selection Reason:</Text>
                    <Text>{player.selectionReason || 'N/A'}</Text>
                  </Box>
                </Stack>
              </CardBody>
            </Card>
          ))}
        </Grid>

        {/* Team Summary */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stack spacing={4}>
              <Heading size="md">Team Summary</Heading>
              <Box>
                <Text fontWeight="medium">Total Projected Points:</Text>
                <Text fontSize="2xl" color="green.500">{predictions.fantasy.teamSummary.totalProjectedPoints}</Text>
              </Box>
              <Box>
                <Text fontWeight="medium" mb={2}>Strengths:</Text>
                <UnorderedList>
                  {predictions.fantasy.teamSummary.strengths.map((strength, index) => (
                    <ListItem key={index}>{strength}</ListItem>
                  ))}
                </UnorderedList>
              </Box>
              <Box>
                <Text fontWeight="medium" mb={2}>Risks:</Text>
                <UnorderedList>
                  {predictions.fantasy.teamSummary.risks.map((risk, index) => (
                    <ListItem key={index}>{risk}</ListItem>
                  ))}
                </UnorderedList>
              </Box>
              <Box>
                <Text fontWeight="medium" mb={2}>Analysis:</Text>
                <Text>{predictions.fantasy.teamSummary.analysis}</Text>
              </Box>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    );
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
        <Flex direction="column" align="center" justify="center" minH="200px">
          <Text mb={4}>Generate match prediction for this match</Text>
          <Button
            colorScheme="blue"
            onClick={() => fetchPrediction('match')}
            isLoading={loading.match}
          >
            Generate Match Prediction
          </Button>
        </Flex>
      );
    }

    const { matchAnalysis, prediction, team1Stats, team2Stats, venue } = predictions.match;

    return (
      <Stack spacing={4}>
        {/* Venue and Win Probability */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stack spacing={4}>
              <Heading size="md">Match Details</Heading>
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

                <Text mb={2}>Conditions: {matchAnalysis.conditions.weather}</Text>
                <Text mb={2}>Pitch: {matchAnalysis.conditions.pitch}</Text>
                <Text mb={4}>Time: {matchAnalysis.conditions.time}</Text>
                
                <Heading size="sm" mb={2}>Win Probability</Heading>
                <Text mb={2}>{predictions.match.team1}: {matchAnalysis.winningProbability.team1}</Text>
                <Progress value={parseInt(matchAnalysis.winningProbability.team1)} colorScheme="blue" mb={4} />
                <Text mb={2}>{predictions.match.team2}: {matchAnalysis.winningProbability.team2}</Text>
                <Progress value={parseInt(matchAnalysis.winningProbability.team2)} colorScheme="green" />
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
                  <Heading size="sm" mb={2}>{predictions.match.team1}</Heading>
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
                  <Heading size="sm" mb={2}>{predictions.match.team2}</Heading>
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
        <Flex direction="column" align="center" justify="center" minH="200px">
          <Text mb={4}>Generate toss prediction for this match</Text>
          <Button
            colorScheme="blue"
            onClick={() => fetchPrediction('toss')}
            isLoading={loading.toss}
          >
            Generate Toss Prediction
          </Button>
        </Flex>
      );
    }

    const { tossPrediction, conditions, historicalData } = predictions.toss;
    const venue = predictions.toss.matchVenue;

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
                <Text mb={2}>{predictions.toss.team1} Toss Win Rate: {historicalData?.team1TossWinRate || 'N/A'}</Text>
                <Text mb={2}>{predictions.toss.team2} Toss Win Rate: {historicalData?.team2TossWinRate || 'N/A'}</Text>
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
    <Tabs isFitted variant="enclosed" colorScheme="blue" index={selectedTab} onChange={setSelectedTab}>
      <TabList mb="1em">
        <Tab>Fantasy XI</Tab>
        <Tab>Match Prediction</Tab>
        <Tab>Toss Prediction</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>{renderFantasyXI()}</TabPanel>
        <TabPanel>{renderMatchPrediction()}</TabPanel>
        <TabPanel>{renderTossPrediction()}</TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default PredictionTabs; 