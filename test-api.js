const baseURL = 'http://localhost:3000/api/v1';

async function runTests() {
    try {
        console.log('--- Starting API Tests ---');

        console.log('1. Testing GET /product');
        const productsRes = await fetch(`${baseURL}/product`);
        const products = await productsRes.json();
        console.log(`Found ${products.data.length} products.`);

        console.log('2. Testing POST /auth/login (User)');
        const loginRes = await fetch(`${baseURL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile: '01123456789', password: 'password123' })
        });
        const loginData = await loginRes.json();
        const userToken = loginData.data.token;
        console.log('User login successful.');

        console.log('3. Testing POST /purchase/cart');
        const cartRes = await fetch(`${baseURL}/purchase/cart`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({ productId: products.data[0]._id, quantity: 1 })
        });
        const cartData = await cartRes.json();
        console.log('Product added to cart.');

        console.log('4. Testing POST /auth/login (Admin)');
        const adminLoginRes = await fetch(`${baseURL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile: '01012345678', password: 'password123' })
        });
        const adminLoginData = await adminLoginRes.json();
        const adminToken = adminLoginData.data.token;
        console.log('Admin login successful.');

        console.log('5. Testing GET /admin/stats');
        const statsRes = await fetch(`${baseURL}/admin/stats`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const stats = await statsRes.json();
        console.log('Admin stats:', stats.data);

        console.log('--- All Tests Passed! ---');
    } catch (err) {
        console.error('Test failed:', err);
    }
}

runTests();
