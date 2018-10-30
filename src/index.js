import { EventEmitter } from 'fbemitter';

import collectListInitialState from './collectListInitialState';
import collectOptions from './collectOptions';

class Filterlist extends EventEmitter {
  constructor(params) {
    super();

    this.requestId = 0;
    this.listState = collectListInitialState(params);
    this.options = collectOptions(params);
  }

  getListState() {
    return this.listState;
  }
}

export default Filterlist;
