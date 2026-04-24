import axios from 'axios';

async function testSeed() {
  try {
    const res = await axios.post('http://localhost:3000/api/dev/seed');
    console.log('Success:', res.data);
  } catch (err: any) {
    console.error('Error:', err.response?.data || err.message);
  }
}

testSeed();
