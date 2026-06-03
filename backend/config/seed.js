const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Post = require('../models/Post');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/techworld');
    console.log('MongoDB Connected for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Post.deleteMany();
    console.log('Database cleared.');

    // Create default accounts
    const publisher = await User.create({
      username: 'Santhosh Naik',
      email: 'santhoshnaik546@gmail.com',
      password: 'Nsanthu@12',
      role: 'publisher',
      profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    });

    const user = await User.create({
      username: 'harshith',
      email: 'user@techworld.com',
      password: 'password123',
      role: 'user',
      profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    });

    console.log('Default accounts created:');
    console.log(' - Publisher: santhoshnaik546@gmail.com / Nsanthu@12 (Santhosh Naik)');
    console.log(' - User: user@techworld.com / password123 (harshith)');

    // Create dummy posts
    const samplePosts = [
      {
        title: 'Apple iPhone 15 Pro Review: Titanium & Type-C',
        description: 'Apple transitions to titanium and USB-C. We review the battery life, camera performance, and the new Action Button.',
        content: `<h3>The Titanium Transition</h3>
<p>Apple's latest flagship, the iPhone 15 Pro, brings major refinements to the series. The headline feature is the shift from stainless steel to Grade 5 titanium, making the phone noticeably lighter and more comfortable in hand. The edges are slightly contoured, giving it a much nicer feel.</p>

<h3>USB-C is Finally Here</h3>
<p>Due to EU regulations, Apple has swapped the Lightning port for a universal USB-C port. The Pro model supports USB 3 speeds of up to 10Gbps, enabling publishers and creators to transfer massive ProRes video files to external storage directly.</p>

<h3>Action Button replaces Mute Switch</h3>
<p>The traditional mute switch has been replaced with an Action Button. Users can customize this button to trigger shortcuts, turn on the flashlight, record voice memos, or keep it as a simple mute switch.</p>

<h3>Camera & A17 Pro Chip</h3>
<p>Powering the device is the A17 Pro, the industry's first 3-nanometer chip. Gaming performance is console-grade, and the cameras feature improved smart HDR and 5x optical zoom on the Max variant.</p>`,
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
        author: publisher._id,
        likes: [user._id],
        comments: [
          {
            user: user._id,
            username: user.username,
            comment: 'Absolutely love the titanium finish. It feels so premium and lightweight!'
          }
        ]
      },
      {
        title: 'Apple Watch Ultra 2: Is it worth the upgrade?',
        description: 'With a brighter screen, double tap gesture, and the new S9 SiP, the Ultra 2 solidifies its position as the ultimate sports watch.',
        content: `<h3>Brighter Display & Gestures</h3>
<p>The Apple Watch Ultra 2 features a massive peak brightness of 3000 nits, making it incredibly legible under direct sunlight. It also introduces the "Double Tap" gesture, which lets you control the primary button of any app by tapping your index finger and thumb together twice.</p>

<h3>S9 chip performance</h3>
<p>The new S9 SiP enables on-device Siri processing, faster dictation, and the Precision Finding feature for iPhone 15 models.</p>

<h3>Battery Life</h3>
<p>It maintains the impressive 36-hour battery life under normal usage and up to 72 hours in low power mode, making it an excellent companion for long treks and multi-day athletic activities.</p>`,
        image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&w=800&q=80',
        author: publisher._id,
        likes: [],
        comments: []
      },
      {
        title: 'Custom Mechanical Keyboards: Beginners Guide 2026',
        description: 'From linear switches to custom keycaps, discover how to build your perfect custom mechanical keyboard for writing and coding.',
        content: `<h3>Why Build a Custom Keyboard?</h3>
<p>Typing on a custom keyboard is a completely different experience. You can choose the exact tactile feel, sound profile, and key layout that matches your workspace. Custom builds have become a massive hobby in the tech world.</p>

<h3>The Anatomy of a Keyboard</h3>
<ul>
  <li><strong>Case:</strong> Usually aluminum or plastic, defining the weight and structure.</li>
  <li><strong>PCB:</strong> The circuit board. Hot-swappable boards are recommended for beginners as they don't require soldering.</li>
  <li><strong>Switches:</strong> Linear (smooth), Tactile (bumpy), or Clicky (loud).</li>
  <li><strong>Keycaps:</strong> ABS or PBT plastics with varying profiles (OEM, Cherry, SA).</li>
</ul>

<h3>Sound Tuning</h3>
<p>Adding case foam, lubing switches with Krytox 205g0, and tuning stabilizers are critical steps to achieving that satisfying "thocky" sound.</p>`,
        image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80',
        author: publisher._id,
        likes: [user._id],
        comments: []
      },
      {
        title: 'Sony WH-1000XM5: The Noise Cancellation King',
        description: 'Sony changes the design and upgrades noise cancellation. Read our long-term review of Sony\'s flagship wireless headphones.',
        content: `<h3>New Sleek Design</h3>
<p>Sony departed from the folding design of the XM4s, opting for a clean, silent-joint design. While they don't fold as compactly, they are extremely comfortable for long flights.</p>

<h3>Acoustic Engineering</h3>
<p>With eight microphones and two processors, the active noise cancellation (ANC) blocks high-frequency sounds and voices better than ever before. Audio quality is punchy with custom EQ options in the Sony Headphones Connect app.</p>`,
        image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
        author: publisher._id,
        likes: [],
        comments: []
      }
    ];

    await Post.insertMany(samplePosts);
    console.log('Sample gadget posts inserted.');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
