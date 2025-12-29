// Debug: Test exact response from /api/ai/check-allergen
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

async function test() {
  try {
    console.log('Testing /api/ai/check-allergen...');
    const response = await api.post('/api/ai/check-allergen', {
      ingredients: ['udang']
    });
    
    console.log('Status:', response.status);
    console.log('Full response:', JSON.stringify(response.data, null, 2));
    console.log('\nIngredients array:');
    console.log(JSON.stringify(response.data.ingredients, null, 2));
    
    if (response.data.ingredients && response.data.ingredients[0]) {
      console.log('\nFirst ingredient allergens:');
      console.log(response.data.ingredients[0].allergens);
      console.log('Type:', typeof response.data.ingredients[0].allergens);
      console.log('Is array:', Array.isArray(response.data.ingredients[0].allergens));
    }
  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message);
  }
}

test();
