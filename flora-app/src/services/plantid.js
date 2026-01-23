const PLANTID_API_KEY = import.meta.env.VITE_PLANTID_API_KEY;
const PLANTID_API_URL = 'https://api.kindwise.com/v1/plant/identification';
const HEALTH_API_URL = 'https://api.kindwise.com/v1/plant/health_assessment';

/**
 * Convert image file to base64
 * @param {File} file - Image file
 * @returns {Promise<string>} Base64 encoded image
 */
export const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove data:image/xxx;base64, prefix
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Identify plant from image
 * @param {string} base64Image - Base64 encoded image
 * @returns {Promise<Object>} Plant identification result
 */
export const identifyPlant = async (base64Image) => {
  try {
    const response = await fetch(PLANTID_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': PLANTID_API_KEY
      },
      body: JSON.stringify({
        images: [base64Image],
        latitude: 41.015137,
        longitude: 28.979530,
        similar_images: true
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Plant identification failed');
    }

    const data = await response.json();

    if (!data.result || !data.result.classification || !data.result.classification.suggestions) {
      throw new Error('No plant identified in the image');
    }

    const topSuggestion = data.result.classification.suggestions[0];

    return {
      commonName: topSuggestion.name || 'Unknown Plant',
      scientificName: topSuggestion.details?.scientific_name || 'N/A',
      probability: topSuggestion.probability,
      description: topSuggestion.details?.description?.value || '',
      wateringFrequency: topSuggestion.details?.watering?.value || 'Moderate',
      sunlight: topSuggestion.details?.sunlight?.value || 'Indirect light',
      wateringInterval: extractWateringDays(topSuggestion.details?.watering?.value),
      taxonomy: topSuggestion.details?.taxonomy || {},
      images: topSuggestion.similar_images || []
    };
  } catch (error) {
    console.error('Error identifying plant:', error);
    throw error;
  }
};

/**
 * Assess plant health from image
 * @param {string} base64Image - Base64 encoded image
 * @returns {Promise<Object>} Health assessment result
 */
export const assessPlantHealth = async (base64Image) => {
  try {
    const response = await fetch(HEALTH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': PLANTID_API_KEY
      },
      body: JSON.stringify({
        images: [base64Image],
        latitude: 41.015137,
        longitude: 28.979530
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Health assessment failed');
    }

    const data = await response.json();

    if (!data.result || !data.result.disease) {
      throw new Error('Could not assess plant health');
    }

    const isHealthy = data.result.is_healthy;
    const diseases = data.result.disease.suggestions || [];

    return {
      isHealthy,
      healthScore: isHealthy ? 95 : (100 - (diseases[0]?.probability || 0) * 100),
      diseases: diseases.map(disease => ({
        name: disease.name,
        probability: disease.probability,
        description: disease.details?.description || '',
        treatment: disease.details?.treatment || '',
        classification: disease.details?.classification || ''
      }))
    };
  } catch (error) {
    console.error('Error assessing plant health:', error);
    throw error;
  }
};

/**
 * Extract watering interval in days from description
 * @param {string} wateringDesc - Watering description
 * @returns {number} Days between watering
 */
function extractWateringDays(wateringDesc) {
  if (!wateringDesc) return 7; // Default to weekly

  const desc = wateringDesc.toLowerCase();

  if (desc.includes('daily')) return 1;
  if (desc.includes('every 2 days')) return 2;
  if (desc.includes('twice a week')) return 3;
  if (desc.includes('weekly') || desc.includes('once a week')) return 7;
  if (desc.includes('every 2 weeks') || desc.includes('bi-weekly')) return 14;
  if (desc.includes('monthly') || desc.includes('once a month')) return 30;

  // Try to extract numbers
  const match = desc.match(/every (\d+) days?/);
  if (match) return parseInt(match[1]);

  return 7; // Default to weekly
}

/**
 * Mock identification for testing without API key
 */
export const mockIdentifyPlant = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        commonName: 'Peace Lily',
        scientificName: 'Spathiphyllum wallisii',
        probability: 0.95,
        description: 'A popular houseplant with elegant white flowers and glossy leaves.',
        wateringFrequency: 'Weekly',
        sunlight: 'Low to moderate indirect light',
        wateringInterval: 7,
        taxonomy: {
          family: 'Araceae',
          genus: 'Spathiphyllum'
        },
        images: []
      });
    }, 2000);
  });
};
