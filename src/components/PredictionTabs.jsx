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
    if (predictions[type] || loading[type]) return;
    
    setLoading(prev => ({ ...prev, [type]: true }));
    setError(prev => ({ ...prev, [type]: null }));
    
    try {
      console.log(`Fetching ${type} prediction for match:`, matchId);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/predictions/${matchId}/${type}`);
      console.log(`${type} prediction response:`, response.data);
      setPredictions(prev => ({ ...prev, [type]: response.data }));
    } catch (err) {
      console.error(`${type} prediction error:`, err);
      const errorMessage = err.response?.data?.message || err.message || `Failed to load ${type} prediction`;
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

  useEffect(() => {
    // Fetch prediction for the selected tab
    const types = ['fantasy', 'match', 'toss'];
    fetchPrediction(types[selectedTab]);
  }, [selectedTab]);

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
    
    if (!predictions.fantasy) return null;

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
    
    if (!predictions.match) return null;

    return (
      <Box>
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} mb={4}>
          <CardBody>
            <Stack spacing={4}>
              <Heading size="md">Win Probability</Heading>
              <Box>
                <Text mb={2}>{predictions.match.team1}: {predictions.match.team1Probability}%</Text>
                <Progress value={predictions.match.team1Probability} colorScheme="blue" mb={4} />
                <Text mb={2}>{predictions.match.team2}: {predictions.match.team2Probability}%</Text>
                <Progress value={predictions.match.team2Probability} colorScheme="green" />
              </Box>
              <Divider />
              <Box>
                <Heading size="sm" mb={2}>Analysis</Heading>
                <Text>{predictions.match.analysis}</Text>
              </Box>
            </Stack>
          </CardBody>
        </Card>
      </Box>
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
    
    if (!predictions.toss) return null;

    return (
      <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
        <CardBody>
          <Stack spacing={4}>
            <Box>
              <Heading size="md" mb={4}>Toss Prediction</Heading>
              <Text fontSize="lg" mb={2}>
                Likely winner: <Badge colorScheme="purple">{predictions.toss.winner}</Badge>
              </Text>
              <Text fontSize="lg">
                Expected decision: <Badge colorScheme="orange">{predictions.toss.decision}</Badge>
              </Text>
            </Box>
            <Divider />
            <Box>
              <Heading size="sm" mb={2}>Reasoning</Heading>
              <Text>{predictions.toss.reasoning}</Text>
            </Box>
          </Stack>
        </CardBody>
      </Card>
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