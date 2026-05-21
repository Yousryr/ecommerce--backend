const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Testimonial = require('./models/testimonial.model');
const User = require('./models/user.model');

dotenv.config();

const seedTestimonials = async () => {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log('Connected to DB for seeding testimonials...');

        await Testimonial.deleteMany();
        
        const user = await User.findOne({ email: 'john@example.com' });

        if (!user) {
            console.log('User not found, run seed.js first.');
            process.exit();
        }

        await Testimonial.create([
            {
                userId: user._id,
                comment: 'This store is amazing! The clothing quality is top notch and delivery was so fast.',
                stars: 5,
                status: 'approved'
            },
            {
                userId: user._id,
                comment: 'I really liked the t-shirts, but the jeans were a bit too tight. Still, great service.',
                stars: 4,
                status: 'approved'
            },
            {
                userId: user._id,
                comment: 'The website is really easy to use and I found exactly what I was looking for.',
                stars: 5,
                status: 'pending'
            }
        ]);

        console.log('Testimonials added successfully!');
        process.exit();
    } catch (err) {
        console.error('Error seeding testimonials:', err);
        process.exit(1);
    }
};

seedTestimonials();
