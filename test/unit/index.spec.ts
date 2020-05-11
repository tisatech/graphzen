import {config} from 'dotenv';
import chaiAsPromised from 'chai-as-promised';
import {use} from 'chai';

use(chaiAsPromised);

describe('# Unit', () => {
  before(() => {
    config();
  });
  require('./model/index.spec');
});
