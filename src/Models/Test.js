import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
  testName: String,
});

const Test = mongoose.model('Test', testSchema);

export default Test; // Test 모델을 기본 내보내기로 설정
