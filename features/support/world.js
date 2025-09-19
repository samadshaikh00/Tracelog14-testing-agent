const { setWorldConstructor } = require('@cucumber/cucumber');
class CustomWorld {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
  }
<<<<<<< HEAD
  
}

=======
}


>>>>>>> 6e9130410f0e86a20f386997f060017f6f8418b6
setWorldConstructor(CustomWorld);