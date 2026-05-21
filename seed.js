const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/category.model');
const Subcategory = require('./models/subcategory.model');
const Product = require('./models/product.model');
const User = require('./models/user.model');
const Testimonial = require('./models/testimonial.model');
const Order = require('./models/order.model');

dotenv.config();

const UNSPLASH = {
  tee: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
  jeans: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600',
  dress: 'https://images.unsplash.com/photo-1595777453313-d2c3c1e2b9c0?w=600',
  hoodie: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600',
  jacket: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600',
  sneakers: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600',
};

const seedData = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log('Connected to DB for seeding...');

    await Testimonial.deleteMany();
    await Order.deleteMany();
    await Product.deleteMany();
    await Subcategory.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();

    console.log('Cleared existing data.');

    const admin = await User.create({
      name: 'Admin User',
      mobile: '01012345678',
      email: 'admin@example.com',
      password: 'password123',
      gender: 'male',
      role: 'admin',
    });

    const john = await User.create({
      name: 'John Doe',
      mobile: '01123456789',
      email: 'john@example.com',
      password: 'password123',
      gender: 'male',
      role: 'user',
    });

    const sara = await User.create({
      name: 'Sara Mohamed',
      mobile: '01098765432',
      email: 'sara@example.com',
      password: 'password123',
      gender: 'female',
      role: 'user',
    });

    const men = await Category.create({ title: 'Men' });
    const women = await Category.create({ title: 'Women' });

    const menTees = await Subcategory.create({ title: 'T-Shirts', categoryId: men._id });
    const menJeans = await Subcategory.create({ title: 'Jeans', categoryId: men._id });
    const menHoodies = await Subcategory.create({ title: 'Hoodies', categoryId: men._id });
    const womenDresses = await Subcategory.create({ title: 'Dresses', categoryId: women._id });
    const womenTops = await Subcategory.create({ title: 'Tops', categoryId: women._id });

    const products = await Product.create([
      { name: 'Basic White Tee', description: 'Comfortable cotton tee for men.', price: 250, image: UNSPLASH.tee, stock: 50, categoryId: men._id, subCategoryId: menTees._id, unitsSold: 45 },
      { name: 'Vintage Graphic Tee', description: 'Retro print oversized t-shirt.', price: 320, image: UNSPLASH.tee, stock: 28, categoryId: men._id, subCategoryId: menTees._id, unitsSold: 62 },
      { name: 'Blue Slim Jeans', description: 'Slim fit denim jeans.', price: 800, image: UNSPLASH.jeans, stock: 30, categoryId: men._id, subCategoryId: menJeans._id, unitsSold: 38 },
      { name: 'Relaxed Fit Jeans', description: 'Loose casual denim.', price: 750, image: UNSPLASH.jeans, stock: 22, categoryId: men._id, subCategoryId: menJeans._id, unitsSold: 25 },
      { name: 'Black Graphic Hoodie', description: 'Streetwear pullover hoodie.', price: 650, image: UNSPLASH.hoodie, stock: 2, categoryId: men._id, subCategoryId: menHoodies._id, unitsSold: 91 },
      { name: 'Zip-Up Hoodie Grey', description: 'Soft fleece zip hoodie.', price: 720, image: UNSPLASH.hoodie, stock: 15, categoryId: men._id, subCategoryId: menHoodies._id, unitsSold: 40 },
      { name: 'Bomber Jacket', description: 'Lightweight casual bomber.', price: 1100, image: UNSPLASH.jacket, stock: 12, categoryId: men._id, subCategoryId: menHoodies._id, unitsSold: 18 },
      { name: 'Summer Floral Dress', description: 'Floral midi dress for women.', price: 1200, image: UNSPLASH.dress, stock: 20, categoryId: women._id, subCategoryId: womenDresses._id, unitsSold: 55 },
      { name: 'Linen Maxi Dress', description: 'Breathable linen maxi.', price: 950, image: UNSPLASH.dress, stock: 14, categoryId: women._id, subCategoryId: womenDresses._id, unitsSold: 33 },
      { name: 'Crop Top White', description: 'Soft cotton crop top.', price: 180, image: UNSPLASH.tee, stock: 40, categoryId: women._id, subCategoryId: womenTops._id, unitsSold: 70 },
      { name: 'Oversized Blouse', description: 'Relaxed fit blouse.', price: 420, image: UNSPLASH.jacket, stock: 8, categoryId: women._id, subCategoryId: womenTops._id, unitsSold: 22 },
      { name: 'Classic Sneakers', description: 'Everyday white sneakers.', price: 890, image: UNSPLASH.sneakers, stock: 0, categoryId: men._id, subCategoryId: menTees._id, unitsSold: 15 },
    ]);

    await Testimonial.create([
      { userId: john._id, comment: 'Amazing quality and fast delivery! The hoodie fits perfectly.', stars: 5, status: 'approved' },
      { userId: sara._id, comment: 'Beautiful dresses and great customer service.', stars: 5, status: 'approved' },
      { userId: john._id, comment: 'Jeans run slightly small — consider sizing up.', stars: 4, status: 'approved' },
      { userId: sara._id, comment: 'Would love more color options for the crop tops.', stars: 4, status: 'pending' },
    ]);

    await Order.create([
      {
        userId: john._id,
        address: '15 Tahrir St, Cairo',
        phoneNumber: john.mobile,
        totalPrice: products[4].price + products[0].price * 2,
        status: 'pending',
        products: [
          { productId: products[4]._id, name: products[4].name, price: products[4].price, quantity: 1 },
          { productId: products[0]._id, name: products[0].name, price: products[0].price, quantity: 2 },
        ],
      },
      {
        userId: sara._id,
        address: '8 Corniche Rd, Alexandria',
        phoneNumber: sara.mobile,
        totalPrice: products[7].price,
        status: 'shipped',
        products: [{ productId: products[7]._id, name: products[7].name, price: products[7].price, quantity: 1 }],
      },
      {
        userId: john._id,
        address: '22 Zamalek, Cairo',
        phoneNumber: john.mobile,
        totalPrice: products[2].price,
        status: 'received',
        products: [{ productId: products[2]._id, name: products[2].name, price: products[2].price, quantity: 1 }],
      },
    ]);

    console.log('Seeding completed successfully!');
    console.log('\nAccounts (password: password123):');
    console.log('  Admin → 01012345678');
    console.log('  User  → 01123456789');
    console.log('  User  → 01098765432');
    console.log(`\n${products.length} products, 4 testimonials, 3 orders`);
    process.exit();
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

seedData();
