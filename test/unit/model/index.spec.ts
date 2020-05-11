import {connect} from 'mongoose';

describe('# Models', () => {
  before(async () => {
    if (!process.env.MONGODB_URI_TEST) {
      throw Error('Testing mongodb URI is not defined.');
    }
    await connect(process.env.MONGODB_URI_TEST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  require('./users/index.spec');
  require('./groups/index.spec');
  require('./members/index.spec');
});
