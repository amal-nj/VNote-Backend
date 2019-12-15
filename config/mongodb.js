const mongoose = require('mongoose')

mongoose.connect(process.env.DB_CONNECTION,{ useNewUrlParser : true, useUnifiedTopology: true})
.then((   ) => console.log('connected MongDB'),
      (err) => console.log(err))

mongoose.set('useCreateIndex', true)