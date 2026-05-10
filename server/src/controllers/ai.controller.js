const AiGeneratedItinerary = require('../models/AiGeneratedItinerary')

// Simple mock itinerary generator
const generateMockItinerary = (destination, days, budget) => {
  const costPerDay = Math.floor(budget / days)
  const daysArray = []

  for (let i = 1; i <= days; i++) {
    daysArray.push({
      day: i,
      title: `Day ${i} in ${destination}`,
      activities: [
        'Explore local attractions',
        'Visit restaurants and cafes',
        'Shopping and sightseeing',
      ],
      meals: {
        breakfast: 'Local breakfast',
        lunch: 'Restaurant lunch',
        dinner: 'Dinner at local spot',
      },
      transport: 'Local taxi/public transport',
      estimatedCost: costPerDay,
    })
  }

  return {
    days: daysArray,
    totalEstimatedCost: budget,
    tips: [
      'Book in advance for better rates',
      'Use local transportation',
      'Try street food',
      'Visit during off-season',
      'Carry travel insurance',
    ],
  }
}

exports.generateItinerary = async (req, res) => {
  try {
    const { destination, days, budget } = req.body
    const userId = req.user.id

    console.log('Request received:', { destination, days, budget, userId })

    if (!destination || !days || !budget) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Generate mock itinerary
    const itineraryData = generateMockItinerary(destination, parseInt(days), parseFloat(budget))

    console.log('Generated itinerary:', itineraryData)

    const aiItinerary = await AiGeneratedItinerary.create({
      userId,
      destination,
      days: parseInt(days),
      budget: parseFloat(budget),
      itinerary: itineraryData,
    })

    console.log('✅ Itinerary saved to DB:', aiItinerary.id)

    res.json({
      id: aiItinerary.id,
      destination,
      days: parseInt(days),
      budget: parseFloat(budget),
      itinerary: itineraryData,
    })
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Stack:', error.stack)
    res.status(500).json({ error: error.message || 'Failed to generate itinerary' })
  }
}

exports.getMyItineraries = async (req, res) => {
  try {
    const userId = req.user.id
    const itineraries = await AiGeneratedItinerary.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    })
    res.json(itineraries)
  } catch (error) {
    console.error('Error fetching itineraries:', error.message)
    res.status(500).json({ error: 'Failed to fetch itineraries' })
  }
}

exports.getItinerary = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const itinerary = await AiGeneratedItinerary.findOne({
      where: { id, userId },
    })

    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' })
    }

    res.json(itinerary)
  } catch (error) {
    console.error('Error fetching itinerary:', error.message)
    res.status(500).json({ error: 'Failed to fetch itinerary' })
  }
}
