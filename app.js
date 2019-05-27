app.get('/dummyHandler',async (req,res)=>{
       console.log('THis is the req.body',req.body);
       projects_db.collection('test_case_dolby').find({}).toArray((err,doc)=>{
       if(err) throw err;
       console.log('This is the returned Data',doc);
       
       })
})
