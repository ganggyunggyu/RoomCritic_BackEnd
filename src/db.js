import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dbConection = () =>
  main()
    .then(() => {
      console.log('DB연결완료');
    })
    .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

export default dbConection;
