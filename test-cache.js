const baseURL = 'http://localhost:3000/api/v1';

async function testCache() {
    try {
        console.log('Testing New Arrivals (First call)...');
        let start = Date.now();
        await fetch(`${baseURL}/product/new-arrivals`);
        console.log(`Time: ${Date.now() - start}ms`);

        console.log('Testing New Arrivals (Second call - should be cached)...');
        start = Date.now();
        await fetch(`${baseURL}/product/new-arrivals`);
        console.log(`Time: ${Date.now() - start}ms`);
    } catch (err) {
        console.error(err);
    }
}

testCache();
